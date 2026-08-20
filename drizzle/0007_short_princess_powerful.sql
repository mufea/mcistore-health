CREATE TABLE `stock_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`previousStock` int NOT NULL,
	`newStock` int NOT NULL,
	`change` int NOT NULL,
	`reason` enum('admin_adjustment','order_fulfilled') NOT NULL,
	`changedByUserId` int,
	`changedByName` varchar(255),
	`orderId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_history_id` PRIMARY KEY(`id`)
);
