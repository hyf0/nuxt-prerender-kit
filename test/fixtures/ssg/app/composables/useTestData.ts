export async function useTestData() {
  return await usePrerenderData('test-data-composable', async () => {
    const { getData } = await import('~~/server/data')
    return getData()
  })
}
