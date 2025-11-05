const logger = (req: { method: any; protocol: any; get: (arg0: string) => any; originalUrl: any }, res: any, next: () => void) => {
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`)
    next()
}

export default logger