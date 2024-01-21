const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const VehicleCategorySchema = Schema({
    categoryName: {type: String, required: true, unique: true},
    categoryNo: {type: Number, required: false, unique: false, default: 0},
    subCategory: [
        {
            subCategoryName: {type: String, required: true, unique: true},
            subCategoryNo: {type: Number, required: false, unique: false, default: 0},
            categoryTag: {type: String, required: false, unique: false},
            upperBidLimit: {type: Number, required: false, unique: false, default: 0},
            lowerBidLimit: {type: Number, required: false, unique: false, default: 0},

            tripSendDriversCount: {type: Number, required: false, unique: false, default: 4}, // **** new ****
            higherBidTripChanceCount: {type: Number, required: false, unique: false, default: 3}, // **** new ****
            subCategorySkippingCount: {type: Number, required: false, unique: false, default: 1}, // **** new ****

            passengerCount: {type: Number, required: false, unique: false, default: 3}, // ************ new ****
            driverTripTimerSecoends: {type: Number, required: false, unique: false, default: 45}, // ************ new ****

            vehicles: [
                {
                    vehicleBrand: {type: String, required: false, unique: false},
                    vehicleName: {type: String, required: false, unique: false},
                    vehicleClass: {type: String, required: false, unique: false},

                    modelCapacity: {type: Number, required: false, unique: false},
                    modelType: {type: String, required: false, unique: false},
                    vehiclePassengerCount: {type: Number, required: false, unique: false},
                    vehicleCapacityWeightLimit: {type: Number, required: false, unique: false},
                    adminCommission: {type: Number, required: false, unique: false},
                    companyCommission: {type: Number, required: false, unique: false},
                },
            ],
            priceSelection: [
                {
                    districtName: {type: String, required: false, unique: false},
                    timeBase: [
                        {
                            timeSlotName: {type: String, required: true, unique: false},
                            startingTime: {type: String, required: false, unique: false},
                            endingTime: {type: String, required: false, unique: false},
                            districtPrice: {type: Number, required: false, unique: false, default: 0},
                            upperBidLimit: {type: Number, required: false, unique: false, default: 0},
                            lowerBidLimit: {type: Number, required: false, unique: false, default: 0},
                            baseFare: {type: Number, required: false, unique: false},
                            minimumFare: {type: Number, required: false, unique: false},
                            minimumKM: {type: Number, required: false, unique: false},
                            belowAboveKMRange: {type: Number, required: false, unique: false},
                            aboveKMFare: {type: Number, required: false, unique: false, default: 0},
                            belowKMFare: {type: Number, required: false, unique: false, default: 0},
                            trafficWaitingChargePerMinute: {type: Number, required: false, unique: false},
                            normalWaitingChargePerMinute: {type: Number, required: false, unique: false},
                            radius: {type: Number, required: false, unique: false},
                            packageDeliveryKMPerHour: {type: Number, required: false, unique: false},
                            packageDeliveryKMPerDay: {type: Number, required: false, unique: false},
                            tripCancelationFee: {type: Number, required: false, unique: false, default: 0}, // **** new ****
                            maxWaitingTimeWithoutCharge: {type: Number, required: false, unique: false, default: 0}, // **** new ****
                        },
                    ],
                },
            ],
            roadPickupPriceSelection: [
                {
                    districtName: {type: String, required: false, unique: false},
                    timeBase: [
                        {
                            timeSlotName: {type: String, required: true, unique: false},
                            startingTime: {type: String, required: false, unique: false},
                            endingTime: {type: String, required: false, unique: false},
                            districtPrice: {type: Number, required: false, unique: false},
                            baseFare: {type: Number, required: false, unique: false},
                            minimumFare: {type: Number, required: false, unique: false},
                            minimumKM: {type: Number, required: false, unique: false},
                            belowAboveKMRange: {type: Number, required: false, unique: false},
                            aboveKMFare: {type: Number, required: false, unique: false},
                            belowKMFare: {type: Number, required: false, unique: false},
                            trafficWaitingChargePerMinute: {type: Number, required: false, unique: false},
                            normalWaitingChargePerMinute: {type: Number, required: false, unique: false},
                            radius: {type: Number, required: false, unique: false},
                            packageDeliveryKMPerHour: {type: Number, required: false, unique: false},
                            packageDeliveryKMPerDay: {type: Number, required: false, unique: false},
                        },
                    ],
                },
            ],
            subDescription: {type: String, required: true, unique: false},
            isEnable: {type: Boolean, required: false, unique: false, default: true},
            packageDelivery: {type: Boolean, required: false, unique: false},
            subCategoryIcon: {type: String, required: false, unique: false, default: null},
            subCategoryIconSelected: {type: String, required: false, unique: false, default: null},
            mapIcon: {type: String, required: false, unique: false, default: null},
            mapIconOffline: {type: String, required: false, unique: false, default: null}, // **** new ****
            mapIconOntrip: {type: String, required: false, unique: false, default: null}, // **** new ****
            subCategoryIconSVG: {type: String, required: false, unique: false, default: null}, // **** new ****
            subCategoryIconSelectedSVG: {type: String, required: false, unique: false, default: null}, // **** new ****
            mapIconSVG: {type: String, required: false, unique: false, default: null}, // **** new ****
            mapIconOfflineSVG: {type: String, required: false, unique: false, default: null}, // **** new ****
            mapIconOntripSVG: {type: String, required: false, unique: false, default: null}, // **** new ****
        },
    ],
    description: {type: String, required: false, unique: false},
    isEnable: {type: Boolean, required: false, unique: false, default: true},
    recordedTime: {type: Date, required: true, unique: false, default: Date.now},
});

module.exports = mongoose.model("VehicleCategory", VehicleCategorySchema);
