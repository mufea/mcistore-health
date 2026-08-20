ALTER TABLE `orders` ADD `reservationStatus` enum('active','released','expired','fulfilled') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `reservationExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `reservationFinalizedAt` timestamp;--> statement-breakpoint
ALTER TABLE `products` ADD `reservedStock` int DEFAULT 0 NOT NULL;