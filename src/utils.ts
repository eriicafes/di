export const arrayIncludes = <Haystack>(needle: any, haystack: ReadonlyArray<Haystack>): needle is Haystack => {
    if (haystack.includes(needle)) return true
    return false
}