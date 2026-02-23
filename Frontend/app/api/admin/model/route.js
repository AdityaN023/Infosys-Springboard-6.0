import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const con = await getDB();

        const [models] = await con.query('SELECT * FROM model;')

        return NextResponse.json({ "success": true, models })
    } catch (error) {
        return NextResponse.json({ "success": false, error })
    }
}

export async function PUT(request) {
    try {
        const con = await getDB();
        const data = await request.json()

        await con.query('UPDATE model SET comments=? WHERE model_id=?;', [data.comments, data.model_id]);

        return NextResponse.json({ "success": true})
    } catch (error) {
        return NextResponse.json({ "success": false, error })
    }
}