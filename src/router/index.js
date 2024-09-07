import { createRouter, createWebHashHistory } from "vue-router";
import StartPage from "@/views/StartPage.vue";
import LoginPage from "@/views/LoginPage.vue";
import SignupPage from "@/views/SignupPage.vue";
import TouristPage from "@/views/TouristPage.vue";
import ProfilePage from "@/views/ProfilePage.vue";

const routes = [
  {
    path: "/",
    name: "start",
    component: StartPage
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage
  },
  {
    path: "/signup",
    name: "signup",
    component: SignupPage
  },
  {
    path: "/tourist",
    name: "tourist",
    component: TouristPage
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfilePage
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;