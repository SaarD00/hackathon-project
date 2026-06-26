import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";
import { isByPassRoutes, isProtectedRoutes, isPublicRoutes } from "./lib/permissions";
const ByPassMatcher = createRouteMatcher(isByPassRoutes)
const PublicMatcher = createRouteMatcher(isPublicRoutes)
const ProtectedMatcher = createRouteMatcher(isProtectedRoutes)
export default convexAuthNextjsMiddleware(async (request, {convexAuth}) => {
    if (ByPassMatcher(request)) return
    const authed = await convexAuth.isAuthenticated()
    if (PublicMatcher(request) && authed) {
        return nextjsMiddlewareRedirect(request, "/dashboard")
    }
    if (ProtectedMatcher(request) && !authed) {
        return nextjsMiddlewareRedirect(request, "/auth/sign-in")
    }
}, {
    cookieConfig:  {
        maxAge: 60*60*24*30
    }
});
 
export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};