export const messageWrap = (data: string, type: string) => {
    const request = JSON.stringify({
        id: 0,
        type,
        data
    })

    console.log(`Answer: ${request}`)

    return request
}