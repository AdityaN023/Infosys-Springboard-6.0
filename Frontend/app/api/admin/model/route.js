import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const con = await getDB();

        const [models] = await con.query('SELECT * FROM model;')

        return NextResponse.json({"success": true, models})
    } catch (error) {
        return NextResponse.json({"success": false, error})
    }
}