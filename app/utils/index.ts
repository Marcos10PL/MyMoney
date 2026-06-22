export const returnErrorStatus = (error: unknown) => {
  const err = error as { response?: { status: number } }
  const statusCode = err.response?.status

  return statusCode
}

export const modalCloseAnimation = async () =>
  await new Promise((resolve) => setTimeout(resolve, 190))
