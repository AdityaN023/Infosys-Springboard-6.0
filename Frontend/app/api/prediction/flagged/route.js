import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const con = await getDB();

        const [flagged_posts] = await con.query('SELECT f.flag_id, j.job_text, f.flagged_time, f.reason, p.`result`, p.confidence_Level, m.version, u.UserName FROM flaggedpost f INNER JOIN jobpostsubmission j ON f.post_id  = j.post_id AND f.reviewed_by IS NULL INNER JOIN predictionresult p ON j.post_id = p.post_id INNER JOIN users u ON j.UserID = u.UserID INNER JOIN model m ON p.model_id = m.model_id;');

        return NextResponse.json({ "success": true, flagged_posts });
    } catch (error) {
        return NextResponse.json({ "success": false, error });
    }
}

export async function POST(request) {
    try {
        const con = await getDB();
        const post_id = (await request.json()).post_id;

        const [flagResult] = await con.query('INSERT INTO flaggedpost (post_id) VALUE (?);', [post_id]);

        return NextResponse.json({ "success": true, flag_id: flagResult.insertId });
    } catch (error) {
        return NextResponse.json({ "success": false, error });
    }
}

export async function PUT(request) {
    try {
        const con = await getDB();
        const flag_Details = await request.json();

        await con.query('UPDATE flaggedpost SET reason=? WHERE flag_id=?;', [flag_Details.reason, flag_Details.flag_id]);

        return NextResponse.json({ "success": true });
    } catch (error) {
        return NextResponse.json({ "success": false, error });
    }
}

export async function DELETE(request) {
    try {
        const con = await getDB();
        const params = await request.json();
        const flag_id = params.flag_id;
        const UserID = params.UserID;
        
        await con.query('UPDATE flaggedpost SET reviewed_by=? WHERE flag_id=?', [UserID, flag_id]);

        return NextResponse.json({'success': true});
    } catch (error) {
        console.log(error)
        return NextResponse.json({'success': false, 'error': error});
    }
}