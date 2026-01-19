import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const UserID = new URL(request.url).searchParams.get('UserID');
        const con = await getDB();

        const [users] = await con.query('SELECT * FROM users WHERE UserID <> ?;', [UserID]);

        const [userCountData] = await con.query("SELECT DATE_FORMAT(CreatedAt, '%b') AS month, COUNT(*) AS count FROM users WHERE YEAR(CreatedAt) = YEAR(NOW()) GROUP BY MONTH(CreatedAt), DATE_FORMAT(CreatedAt, '%b') ORDER BY MONTH(CreatedAt);")

        const [usageCountData] = await con.query("SELECT DATE_FORMAT(datetime, '%a') AS day, COUNT(datetime) AS count FROM logs WHERE WEEKOFYEAR(datetime) = WEEKOFYEAR(NOW()) AND action_type = 'prediction' GROUP BY DAYOFWEEK(datetime), DATE_FORMAT(datetime, '%a') ORDER BY DAYOFWEEK(datetime);");
        
        const userCount = userCountData.reduce((acc, { month, count }) => {
            acc[month] = count;
            return acc;
        }, {});
        
        const usageCount = usageCountData.reduce((acc, { day, count }) => {
            acc[day] = count;
            return acc;
        }, {});
        
        return NextResponse.json({
            'success': true,
            users,
            userCount,
            usageCount
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            'success': false,
            error
        });
    }
}

export async function PUT(request) {
    try {
        const con = await getDB();
        const body = await request.json();

        const role = body.type === 'Promote' ? 'Admin' : 'User';

        const [updateRole] = await con.query('UPDATE users SET UserRole=? WHERE UserID=?;', [role, body.UserID]);

        return NextResponse.json({
            'success': true
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            'success': false,
            error
        });
    }
}