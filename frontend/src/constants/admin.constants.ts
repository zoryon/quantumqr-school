import { AdminActivity } from "@/types";

export const ADMIN_ACTIVITIES: AdminActivity[] = [
    {
        url: "/admin/ban",
        icon: "fas fa-users text-blue-400",
        bg: "bg-blue-500/20",
        title: "User Management",
        paragraph: "Manage user accounts, view statistics, and perform administrative actions"
    },
    {
        url: "/admin/review",
        icon: "fas fa-star text-purple-400",
        bg: "bg-purple-500/20",
        title: "Promotion Reviews",
        paragraph: "Review and approve/deny user requests for promotions"
    },
    {
        url: "/admin/analytics",
        icon: "fas fa-chart-line text-green-400",
        bg: "bg-green-500/20",
        title: "Platform Analytics",
        paragraph: "Access detailed platform usage statistics and metrics"
    },
] as const;