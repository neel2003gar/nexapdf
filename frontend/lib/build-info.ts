// Cache buster for deployment - ensuring new build
export const BUILD_TIME = new Date().toISOString()
console.log('🔄 Build time:', BUILD_TIME)