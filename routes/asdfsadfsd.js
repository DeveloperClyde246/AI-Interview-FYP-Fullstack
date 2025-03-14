const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Interview = require("../models/Interview");
const User = require("../models/User");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const axios = require("axios");