class Caravan {
    constructor(leader) {
        this.leader = leader;
        this.healers = [];
        this.rangers = [];
    }

    addHealer(healer) {
        this.healers.push(healer);
    }

    addRanger(ranger) {
        this.rangers.push(ranger);
    }

    // Method to command the caravan to move
    moveTo(target) {
        this.leader.travel({ goal: target, range: 1 });
        // Additional logic for following behavior can go here
    }

    // Method for the caravan to attack
    attack() {
        this.rangers.forEach(ranger => ranger.attackEnemyAttackers());
    }

    // Additional methods for caravan behavior can be added here
}
import { getObjectsByPrototype, getRange } from 'game';
import { Creep } from 'game/prototypes';

let caravanInstance = null;

export function caravanLeader(creep) {
    // Find squad members with specific roles
    const squadMembers = getObjectsByPrototype(Creep).filter(other => 
        other.my && 
        (other.role === 'caravanHealer' || other.role === 'caravanRanger') &&
        getRange(creep, other) <= 5
    );

    // Check if we have the necessary members
    const healers = squadMembers.filter(member => member.role === 'caravanHealer');
    const rangers = squadMembers.filter(member => member.role === 'caravanRanger');

    // If we don't have enough members yet, wait
    if (squadMembers.length < 4) return;

    // If all members are present and we don't have a caravan instance, create one
    if (!caravanInstance) {
        caravanInstance = new Caravan(creep); // `creep` is the leader
    }

    // Add healers and rangers to the caravan
    healers.forEach(healer => caravanInstance.addHealer(healer));
    rangers.forEach(ranger => caravanInstance.addRanger(ranger));

    // Move leader towards enemies/objectives
    creep.attackEnemyAttackers();

    // Use caravan instance to move or attack
    caravanInstance.moveTo({ pos: creep, range: 1 });

    // Have healers heal
    caravanInstance.healers.forEach(healer => healer.advancedHeal());

    // Have rangers attack
    caravanInstance.attack();
}

