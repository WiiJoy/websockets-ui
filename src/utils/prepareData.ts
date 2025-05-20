export const prepareUser = (name: string, index: string, error: boolean = false, errorText: string = '') => {
    return {
        name, index, error, errorText
    }
}