import proxy from "express-http-proxy"

export const proxyWithHeader = (serviceUrl, options = {}) => {
    const { proxyReqOptDecorator, ...proxyOptions } = options

    return proxy(serviceUrl, {
        ...proxyOptions,
        proxyReqOptDecorator: async (proxyReqOpts, srcReq) => {
            if (srcReq.user) {
                proxyReqOpts.headers["x-user-id"] = srcReq.user.userId
            }

            return proxyReqOptDecorator
                ? await proxyReqOptDecorator(proxyReqOpts, srcReq)
                : proxyReqOpts
        }
    })
}