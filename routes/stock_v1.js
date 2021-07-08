const express = require('express')
const router = express.Router()

const catch_error = require('../handlers/error').catch_error
const only_catch_error = require('../handlers/error').only_catch_error

const tda_controller = require(`../controllers/tda`)

/********************************************************************************
auth
********************************************************************************/

router.route('/auth/td').get(catch_error(tda_controller.get_auth))

module.exports = router
