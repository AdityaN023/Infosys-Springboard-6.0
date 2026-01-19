import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getDB } from '@/lib/db'
import generatePassword from '@/lib/randomPassword'
import { compare, hash } from 'bcrypt'

const handler = NextAuth({
    nextUrl: process.env.NEXTAUTH_URL,
    secret: process.env.AUTH_SECRET,
    session: {
        strategy: 'jwt'
    },
    pages: {
        'signIn': '/',
        'error': '/'
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_SECRET
        }),

        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_SECRET
        }),

        CredentialsProvider({
            name: "Credentials",

            async authorize(credentials, req) {

                const con = await getDB();

                const [userDetails] = await con.query('SELECT * FROM users WHERE UserEmail=?;', [credentials.email]);

                if (userDetails.length > 0) {
                    const result = await compare(credentials.password, userDetails[0].UserPassword);
                    if (result) {
                        await con.query('UPDATE users SET LoginAt=? WHERE UserID=?;', [new Date(), userDetails[0].UserID]);
                        await con.query('INSERT INTO logs (UserID, action_type, description) VALUES (?, ?, ?);', [userDetails[0].UserID, 'signin', `User Signed In using credentials`]);

                        return {
                            'UserID': userDetails[0].UserID,
                            'name': userDetails[0].UserName,
                            'email': userDetails[0].UserEmail,
                            'UserRole': userDetails[0].UserRole
                        }
                    } else {
                        throw new Error('Invalid email or password');
                    }
                } else {
                    throw new Error('User not found. Please Sign Up');
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            if (account.provider != 'credentials') {
                try {
                    const con = await getDB();

                    let UserRole = 'User';
                    const [count] = await con.query('SELECT COUNT(UserID) as \'count\' FROM users;');
                    if (count[0].count === 0) UserRole = 'Admin';

                    const [userDetails] = await con.query("SELECT UserID FROM users WHERE UserEmail = ?", [user.email]);

                    if (userDetails.length === 0) {
                        const password = generatePassword(8);
                        const encryptedPass = await hash(password, 10);

                        const [newUser] = await con.query('INSERT INTO users (UserName, UserEmail, UserPassword, LoginAt, UserRole) VALUES (?, ?, ?, ?, ?);', [user.name, user.email, encryptedPass, new Date(), UserRole]);
                        await con.query('INSERT INTO logs (UserID, action_type, description) VALUES (?, ?, ?);', [newUser.insertId, 'signup', `User Signed Up using ${account?.provider}`]);
                        await con.query('INSERT INTO logs (UserID, action_type, description) VALUES (?, ?, ?);', [newUser.insertId, 'signin', `Signed In using ${account?.provider}`]);
                    } else {
                        await con.query('UPDATE users SET LoginAt=? WHERE UserID=?;', [new Date(), userDetails[0].UserID]);
                        await con.query('INSERT INTO logs (UserID, action_type, description) VALUES (?, ?, ?);', [userDetails[0].UserID, 'signin', `Signed In using ${account?.provider}`]);
                    }

                    return true;
                } catch (e) {
                    console.log(e);
                    return false;
                }
            } else {
                return true
            }
        },
        async jwt({ token, user, account, profile, isNewUser }) {
            if (user) {
                if (account?.provider === "google" || account?.provider === "github") {
                    const con = await getDB();
                    const [userDetails] = await con.query("SELECT UserID, UserRole FROM users WHERE UserEmail = ?", [user.email]);

                    token.UserID = userDetails[0].UserID;
                    token.UserRole = userDetails[0].UserRole;
                } else {
                    token.UserID = user.UserID;
                    token.UserRole = user.UserRole;
                }
            }
            return token;
        },
        async session({ session, user, token }) {
            session.user.UserID = token.UserID;
            session.user.UserRole = token.UserRole;
            return session;
        },
    },
    events: {
        async signOut({ token, session }) {
            try {
                const con = await getDB();
                await con.query('INSERT INTO logs (UserID, action_type, description) VALUES (?, ?, ?);', [token.UserID, 'signout', `User signed out`]);
            } catch (error) {
                console.log(error)
            }
        },
    },
});

export { handler as GET, handler as POST }