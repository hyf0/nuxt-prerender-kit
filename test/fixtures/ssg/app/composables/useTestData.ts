export async function useTestData() {
  return await useBuildAsyncData('test-data-composable', async () => {
    const { getData } = await import('~~/server/data')
    return getData()
  })
}
