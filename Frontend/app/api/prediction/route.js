import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const con = await getDB();
        const { searchParams } = new URL(request.url);

        const UserID = searchParams.get('UserID');
        const job_text = searchParams.get('job_text');
        const type = searchParams.get('type');

        let query = '';
        let values = [];

        if (job_text && type) {
            query = `
                SELECT p.result, p.confidence_Level
                FROM jobpostsubmission j
                INNER JOIN predictionresult p ON j.post_id = p.post_id
                WHERE j.UserID = ?
                  AND j.job_text = ?
                  AND j.pred_type = ?
            `;
            values = [UserID, job_text, type];
        }

        else {
            query = `
                SELECT 
                    j.post_id,
                    ${type ? 'j.job_text,' : ''}
                    p.predict_At,
                    p.result,
                    p.confidence_Level,
                    ${type ? 'f.flag_id' : 'j.pred_type'}
                FROM jobpostsubmission j
                INNER JOIN predictionresult p ON j.post_id = p.post_id
                LEFT JOIN flaggedpost f ON j.post_id = f.post_id
                WHERE j.UserID = ?
                ${type ? 'AND j.pred_type = ?' : ''}
                ORDER BY p.predict_At DESC
            `;

            values = type ? [UserID, type] : [UserID];
        }

        const [rows] = await con.query(query, values);

        return NextResponse.json({
            success: rows.length > 0,
            data: rows
        });
    } catch (error) {
        console.error('GET prediction error:', error);
        return NextResponse.json(
            { success: false, error },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const pool = await getDB();
    const con = await pool.getConnection();
    try {
        const data = await request.json();

        await con.beginTransaction();

        // 1️⃣ Insert job post
        const [jobResult] = await con.query('INSERT INTO jobpostsubmission (job_text, submission_time, pred_type, UserID) VALUES (?, ?, ?, ?)', [data['job_text'], new Date(data['submission_time']), data.type, data.UserID]);

        const jobPostId = jobResult.insertId;

        // 3️⃣ Insert prediction
        await con.query('INSERT INTO predictionresult (post_id, result, confidence_Level, model_id) VALUES (?, ?, ?, ?)', [jobPostId, data.result, data.confidence_Level, data.model_id]);
    
        await con.query('INSERT INTO logs (UserID, action_type, description) VALUES (?, ?, ?);', [data.UserID, 'prediction', `User performed ${data.type} prediction`]);

        await con.commit();

        return NextResponse.json({ "success": true });
    } catch (error) {
        await con.rollback();
        return NextResponse.json({ "success": false, error });
    }
}