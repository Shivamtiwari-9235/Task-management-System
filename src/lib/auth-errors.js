export function getAuthErrorMessage(error) {
  const code = error?.code ?? error?.name;
  const message = error?.message?.toLowerCase() ?? '';

  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return 'Your email address has not been verified yet. Check your inbox or request a new verification email.';
  }

  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return 'The email or password is incorrect. Check your details and try again.';
  }

  if (code === 'user_already_exists' || message.includes('user already registered')) {
    return 'An account with this email already exists. Try logging in instead.';
  }

  if (message.includes('password should be at least')) {
    return 'Your password must be at least 6 characters long.';
  }

  return 'We could not complete your request. Please try again.';
}
