import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const swipeLogic = async (direction: string, productId: string) => {
    if (direction === "right") {
        console.log("Swiped right on", productId);

        // Retrieve cache from localStorage
        const storedLikes = JSON.parse(
            localStorage.getItem("likedProducts") || "[]"
        );

        // Update cache with new like
        let newLikedProducts = [...storedLikes, productId];
        newLikedProducts = newLikedProducts.map((item) => parseInt(item));

        localStorage.setItem("likedProducts", JSON.stringify(newLikedProducts));

        // If batch size reached, send to server
        if (newLikedProducts.length >= 10) {
            await saveLikesToServer(newLikedProducts);
            localStorage.removeItem("likedProducts"); // Clear cache after sync
        }
    } else {
        console.log("Swiped left on", productId);
    }
};

export const saveLikesToServer = async (likedItems: number[]) => {
    try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
            console.error("User not authenticated");
            return;
        }
        const res = await fetch("http://localhost:8080/api/users/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: data.user.id,
                productIds: likedItems,
            }),
        });

        const response = await res;
        if (!response.ok){
            const error = await response.text();
            throw new Error(error);
        } 
        console.log("Likes saved successfully:", data);
    } catch (err) {
        console.error("Error saving likes:", err);
    }
};
