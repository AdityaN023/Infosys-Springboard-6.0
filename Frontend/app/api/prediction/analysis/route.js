import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET(request) {
    try {
        const con = await getDB();
        const UserID = new URL(request.url).searchParams.get('UserID');

        const [textPredictions] = await con.query('SELECT p.result AS "category", COUNT(p.result) AS "count" FROM jobpostsubmission j INNER JOIN predictionresult p ON j.post_id = p.post_id AND j.UserID = ? LEFT OUTER JOIN flaggedpost f ON j.post_id = f.post_id WHERE j.pred_type="text" GROUP BY p.result;', [UserID]);

        const textpredict = textPredictions.reduce((acc, { category, count }) => {
            acc[category] = count;
            acc['total'] += count;
            return acc;
        }, { total: 0, 'real': 0, 'fake': 0 });

        const [imgPredictions] = await con.query('SELECT p.result AS "category", COUNT(p.result) AS "count" FROM jobpostsubmission j INNER JOIN predictionresult p ON j.post_id = p.post_id AND j.UserID = ? LEFT OUTER JOIN flaggedpost f ON j.post_id = f.post_id WHERE j.pred_type="image" GROUP BY p.result;', [UserID]);

        const imgpredict = imgPredictions.reduce((acc, { category, count }) => {
            acc[category] = count;
            acc['total'] += count;
            return acc;
        }, { total: 0, 'real': 0, 'fake': 0 });

        return NextResponse.json({
            success: true,
            textpredict,
            imgpredict
        });
    } catch (e) {
        console.log(e)
        return NextResponse.json({ success: false, error: e });
    }
}