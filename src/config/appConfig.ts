const appConfig = {
  // Admin authentication - supports multiple admin emails
  adminEmails: process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map((email) => email.trim().toLowerCase())
    : ['thriiftverse.shop@gmail.com'],
}

export default appConfig
