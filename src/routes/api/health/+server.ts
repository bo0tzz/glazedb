import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async () => {
	try {
		await db.selectFrom('glazes').select(db.fn.count('id').as('count')).executeTakeFirst();
		return new Response(JSON.stringify({ status: 'ok' }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch {
		return new Response(JSON.stringify({ status: 'error' }), {
			status: 503,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
