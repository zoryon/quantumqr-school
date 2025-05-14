import { ApiDefinition } from "@/types";

export const API_CONFIG = {
  users: {
    current: { method: "GET" },
    requestPromotion: { method: "POST" },
  },
  admin: {
    findPromotions: { method: "GET" },
    reviewPromotion: { method: "POST" },
    banUser: { method: "POST" },
    findAllUsers: { method: "GET" },
    appStats: { method: "GET" },
  },
  qrcodes: {
    find: { method: "GET" },
    findAll: { method: "GET" },
    create: { method: "POST" },
    delete: { method: "DELETE" },
    trackScan: { method: "POST" },
    update: { method: "PUT" },
  },
  auth: {
    register: {
      register: { method: "POST" },
      confirm: { method: "GET" },
    },
    login: { method: "POST" },
    forgotPassword: {
      reset: { method: "POST" },
      sendEmail: { method: "POST" },
    },
    logout: { method: "GET" },
  },
  policies: { method: "GET" },
  subscriptions: {
    tiers: { method: "GET" },
    change: { method: "POST" },
  },
} satisfies ApiDefinition;