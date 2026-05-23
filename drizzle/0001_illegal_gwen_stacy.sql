CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`productPrice` decimal(12,2) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`subtotal` decimal(12,2) NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(32) NOT NULL,
	`userId` int,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(32) NOT NULL,
	`streetAddress` text NOT NULL,
	`aptNumber` varchar(64),
	`city` varchar(128) NOT NULL,
	`province` varchar(128) NOT NULL,
	`postalCode` varchar(16) NOT NULL,
	`country` varchar(128) NOT NULL,
	`shippingStreet` text NOT NULL,
	`shippingApt` varchar(64),
	`shippingCity` varchar(128) NOT NULL,
	`shippingProvince` varchar(128) NOT NULL,
	`shippingPostal` varchar(16) NOT NULL,
	`shippingCountry` varchar(128) NOT NULL,
	`shippingType` enum('national','international') NOT NULL,
	`shippingCost` decimal(12,2) NOT NULL,
	`paymentMethod` enum('bank_transfer','midtrans') NOT NULL,
	`paymentStatus` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`midtransOrderId` varchar(128),
	`midtransToken` text,
	`midtransRedirectUrl` text,
	`midtransPaymentType` varchar(64),
	`status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`subtotal` decimal(12,2) NOT NULL,
	`total` decimal(12,2) NOT NULL,
	`surveyResponseId` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(12,2) NOT NULL,
	`category` varchar(128) NOT NULL,
	`imageUrl` text,
	`imageKey` text,
	`targetSegment` enum('all','standard','premium','vip') NOT NULL DEFAULT 'all',
	`stock` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`tags` json,
	`recommendationTags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `survey_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`order` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `survey_pages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `survey_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageId` int NOT NULL,
	`text` text NOT NULL,
	`type` enum('single_choice','multiple_choice','text','scale') NOT NULL,
	`options` json,
	`order` int NOT NULL DEFAULT 0,
	`isRequired` boolean NOT NULL DEFAULT true,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `survey_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `survey_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`userId` int,
	`answers` json NOT NULL,
	`recommendedSegment` enum('standard','premium','vip') DEFAULT 'standard',
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `survey_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `segment` enum('standard','premium','vip') DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `streetAddress` text;--> statement-breakpoint
ALTER TABLE `users` ADD `aptNumber` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `province` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `postalCode` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(128);