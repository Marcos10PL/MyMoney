declare module '#auth-utils' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends Pick<AppUser, 'id' | 'login' | 'role'> {}

  interface UserSession {
    user: User
    loggedInAt: string
  }
}
