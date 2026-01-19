import { getDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request) {
    try {
        const con = await getDB();
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format');

        const [flaggedPost] = await con.query("SELECT j.job_text, p.result, CASE WHEN p.result = 'fake' THEN 0 WHEN p.result = 'real' THEN 1 END AS expected_result FROM flaggedpost f INNER JOIN jobpostsubmission j ON f.post_id  = j.post_id AND f.reviewed_by IS NULL INNER JOIN predictionresult p ON j.post_id = p.post_id INNER JOIN users u ON j.UserID = u.UserID;")

        const worksheet = XLSX.utils.json_to_sheet(flaggedPost);

        if (format === 'csv') {
            const csv = XLSX.utils.sheet_to_csv(worksheet, { forceQuotes: true })
            return new NextResponse(csv, {
                status: 200,
                headers: {
                    'Content-Disposition': `attachment; filename="table.csv"`,
                    'Content-Type': 'text/csv',
                },
            })
        }else if (format === 'txt') {
            const txt = XLSX.utils.sheet_to_txt(worksheet, { forceQuotes: true })
            return new NextResponse(txt, {
                status: 200,
                headers: {
                    'Content-Disposition': `attachment; filename="table.txt"`,
                    'Content-Type': 'text/csv',
                },
            })
        } else {
            return new NextResponse.json(flaggedPost)
        }
    } catch (error) {
        return new NextResponse.error('Something went wrong...')
    }
}