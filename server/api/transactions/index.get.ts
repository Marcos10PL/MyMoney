import { transactionsQuerySchema } from '~~/server/schema/query'

export default defineEventHandler(async (event) => {
  const { user } = getEventContext(event)
  const query = await getValidatedQuery(event, transactionsQuerySchema.parse)
  const { data, pagination, sums } = await listTransactions(user.id, query)

  return {
    success: true,
    message: 'Transactions fetched successfully',
    data,
    pagination,
    sums,
  }
})
