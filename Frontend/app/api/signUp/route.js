import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";

export async function GET(request) {
    try {
        const con = await getDB();

        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        const [rows] = await con.query(
            "SELECT UserId FROM users WHERE UserEmail = ?",
            [email]
        );

        return NextResponse.json({
            userExist: rows.length > 0
        });
    } catch (e) {
        console.log(e);
    }
}

export async function PUT(request) {
    try {
        const con = await getDB();
        const userDetails = await request.json();

        const encryptedPass = await hash(userDetails.password, 10);

        await con.query('UPDATE users SET UserPassword=? WHERE UserEmail=?;', [encryptedPass, userDetails.email]);

        return NextResponse.json({ done: true });
    } catch (e) {
        console.log(e);
        return NextResponse.json({ done: false });
    }
}

export async function POST(request) {
    try {
        const con = await getDB();
        const userDetails = await request.json();
        const encryptedPass = await hash(userDetails.password, 10);
        
        let UserRole = 'User';
        const [count] = await con.query('SELECT COUNT(UserID) as \'count\' FROM users;');
        if (count[0].count === 0) UserRole = 'Admin';


        const [user] = await con.query('INSERT INTO users (UserName, UserEmail, UserPassword, UserRole) VALUES (?, ?, ?, ?);', [userDetails.uname, userDetails.email, encryptedPass, UserRole]);
        await con.query('INSERT INTO logs (UserID, action_type, description) VALUES (?, ?, ?);', [user.insertId, 'signup', `User Signed Up using credentials`]);

        return NextResponse.json({ done: true });
    } catch (e) {
        console.log(e);
        return NextResponse.json({ done: false });
    }
}