import SettingsClient from './SettingsClient';

export const instant = false;

export default async function ProjectSettingsPage({ params }) {
  const { id } = await params;
  return <SettingsClient id={id} />;
}
