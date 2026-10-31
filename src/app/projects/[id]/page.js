import ProjectClient from './ProjectClient';

export const instant = false;

export default async function ProjectPage({ params }) {
  const { id } = await params;
  return <ProjectClient id={id} />;
}
