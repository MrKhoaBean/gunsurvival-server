import Player from "./Player.js";
import Bag from "./Bag.js";
import * as Item from "../../item/index.js";
import * as Matter from "matter-js";

class Human extends Player {
	constructor(config = {}) {
		config = Matter.Common.extend({
		    matterBodyOption: {
		    	circleRadius: 40
		    }
		}, config);
		super(config);

		const {
			bag = ["ak47"],
		} = config;

        this.bag = new Bag();
        this.bag.add(new Item.Gun.Automatic({
        	ownerID: this.id,
        	name: "ak47",
        	id: "ak47" + Date.now()
        }));
        this.blood = 100;
        this.status = {};
	}

	getMovingSpeed() {
		let speed = 8;
		// let holdingGun = this.bag.arr[this.bag.index];
		// speed -= holdingGun.weight;

		if (this.logkmManager.find({
			mouseButton: "left",
			value: true
		})) {
			// decrease speed when firing
			speed--;
		}

		if (this.logkmManager.find({
			keyCode: 16,
			value: true
		})) {
			// is walking
			speed *= 5 / 10;
		}

		if (speed <= 1) speed = 1;

		return speed / this.getScale(); //cang to = cang di cham
	}

	isDead() {
		return this.blood <= 0;
	}

	getScale() {
		return Math.min(Math.max(this.blood / 100, 0.5), 2); // 0.5 >= x >= 2
	}

	update(queueAddSprites) {
		super.update(queueAddSprites);

		if (this.isDead()) {
			return;
		}
		
		this.status.hideInTree = false;
		this.status.moving = false;

		const item = this.bag.getCurrentItem();
		if (item)
			item.update(queueAddSprites, this);
			// item.update(owner, queueAddSprites);
	}

	collide(object) {
		switch (object.origin.type) {
			case "Bullet":
				if (this.id != object.origin.ownerID) {
					let bulletSpeed = Math.sqrt(
						Math.pow(object.copy.speed.x, 2) +
							Math.pow(object.copy.speed.y, 2)
					); // bullet speed
					let defaultSpeed = 200; // bullet default speed to kill someone, reach this, will make 100 damage
					// let defaultRange = 16;
					let damage =
						100 *
						(bulletSpeed / defaultSpeed) *
						(object.origin.getQueryRange() / 20); // damage chia 2 vi eo hieu sao no bi dinh dan 2 lan :(
					this.blood -= Math.round(damage);
					if (this.blood < 0) {
						this.blood = 0;
						this.killerID = object.origin.ownerID;
					}
				}
				break;
			case "Tree":
				this.status.hideInTree = true;
				break;
			case "Human": {
				let vectorHimMe = {
					x: this.pos.x - object.copy.pos.x,
					y: this.pos.y - object.copy.pos.y
				};
				let mag = Math.sqrt(
					Math.pow(vectorHimMe.x, 2) + Math.pow(vectorHimMe.y, 2)
				);
				let newMag =
					(object.origin.getQueryRange() + this.getQueryRange()) / 2;
				let scaleMag = newMag / mag;
				this.pos.x = vectorHimMe.x * scaleMag + object.copy.pos.x;
				this.pos.y = vectorHimMe.y * scaleMag + object.copy.pos.y;
				break;
			}
			case "Rock": {
				let vectorRockMe = {
					x: this.pos.x - object.origin.pos.x,
					y: this.pos.y - object.origin.pos.y
				};
				let mag = Math.sqrt(
					Math.pow(vectorRockMe.x, 2) + Math.pow(vectorRockMe.y, 2)
				);
				let newMag =
					(object.origin.getQueryRange() + this.getQueryRange()) / 2;
				let scaleMag = newMag / mag;
				this.pos.x = vectorRockMe.x * scaleMag + object.origin.pos.x;
				this.pos.y = vectorRockMe.y * scaleMag + object.origin.pos.y;
				break;
			}
			case "Score":
				this.blood += object.copy.value;
				break;
		}
	}

	getData() {
		return Object.assign(super.getData(), {
		});
	}
}

export default Human;
