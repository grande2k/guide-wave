import { createRouter, createWebHashHistory } from "vue-router";
import HomePage from "@/views/HomePage.vue";
import LoginPage from "@/views/LoginPage.vue";
import ForgotPasswordPage from "@/views/ForgotPasswordPage.vue";
import SignupPage from "@/views/SignupPage.vue";
import SearchPage from "@/views/SearchPage.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: ForgotPasswordPage,
  },
  {
    path: "/signup",
    name: "signup",
    component: SignupPage
  },
  {
    path: "/search",
    name: "search",
    component: SearchPage
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/ProfilePage.vue"),
    meta: { requiresAuth: true, role: '1' },
  },
  {
    path: "/admin",
    name: "admin",
    component: () => import("@/views/AdminPage.vue"),
    meta: { requiresAuth: true, role: '2' },
    children: [
      {
        path: "guides",
        name: "admin-guides",
        component: () => import("@/components/admin/AdminUsers.vue"),
        meta: { requiresAuth: true, role: '2' },
      },
      {
        path: "services",
        name: "admin-services",
        component: () => import("@/components/admin/AdminServices.vue"),
        meta: { requiresAuth: true, role: '2' },
      },
      {
        path: "locations",
        name: "admin-locations",
        component: () => import("@/components/admin/AdminLocations.vue"),
        meta: { requiresAuth: true, role: '2' },
      },
      {
        path: "languages",
        name: "admin-languages",
        component: () => import("@/components/admin/AdminLanguages.vue"),
        meta: { requiresAuth: true, role: '2' },
      },
      {
        path: "interfaces",
        name: "admin-interfaces",
        component: () => import("@/components/admin/AdminInterfaces.vue"),
        meta: { requiresAuth: true, role: '2' },
      },
      {
        path: "translations",
        name: "admin-translations",
        component: () => import("@/components/admin/AdminTranslations.vue"),
        meta: { requiresAuth: true, role: '2' },
      }
    ]
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const accessToken = $cookies.get("access_token");
  const userRole = $cookies.get("user_role");
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!accessToken) {
      next('/login');
    } else if (to.meta.role && to.meta.role !== userRole) {
      if (userRole === '1') {
        next('/profile');
      } else if (userRole === '2') {
        next('/admin');
      } else {
        next('/login');
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;