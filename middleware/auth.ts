export default defineNuxtRouteMiddleware(async (to, from) => {
    const user = useSupabaseUser();
    const { data } = await useSupabaseClient().auth.getSession();
    
    // If user is not logged in and trying to access a protected route
    if (!data.session && to.path !== '/auth/login') {
      return navigateTo('/auth/login');
    }
  });