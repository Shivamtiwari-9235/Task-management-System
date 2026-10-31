export function getDatabaseErrorMessage(error) {
  if (error?.code === '42P17' || error?.message?.includes('infinite recursion')) {
    return 'We are unable to load project data right now. Please refresh the page. If the problem continues, run the latest Supabase schema setup.';
  }

  if (error?.code === '42501' || error?.status === 401 || error?.status === 403) {
    return 'Your session is not authorized for this action. Please sign in again, then try again.';
  }

  if (error?.code === '22P02') {
    return 'Please enter a valid UUID.';
  }

  if (error?.code === '23503') {
    return 'That user ID does not belong to an existing Supabase user.';
  }

  if (error?.code === '23505' || error?.message?.toLowerCase().includes('duplicate')) {
    return 'This record already exists.';
  }

  return 'We could not complete this action. Please try again.';
}
