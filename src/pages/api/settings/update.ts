import type { APIRoute } from 'astro';
import { getEnv } from '../../../lib/db';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const env = getEnv(context);
  const form = await context.request.formData();

  const home_tagline = String(form.get('home_tagline') || '').trim();
  const home_intro = String(form.get('home_intro') || '').trim();
  const mission = String(form.get('mission') || '').trim();
  const objectives = String(form.get('objectives') || '').trim();
  const activities = String(form.get('activities') || '').trim();
  const contact_email = String(form.get('contact_email') || '').trim();
  const contact_address = String(form.get('contact_address') || '').trim();

  await env.DB.prepare(
    `UPDATE institutional SET home_tagline=?, home_intro=?, mission=?, objectives=?, activities=?, contact_email=?, contact_address=?, updated_at=CURRENT_TIMESTAMP
     WHERE id = 1`
  ).bind(home_tagline, home_intro, mission, objectives, activities, contact_email, contact_address).run();

  return context.redirect('/admin/institucional?updated=1');
};
