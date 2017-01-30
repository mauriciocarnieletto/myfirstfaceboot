'use strict'
// NodeCache
const NodeCache = require('node-cache');
const myCache = new NodeCache();

var util = require('util');
/**
 * Facebook
 */
function Session() {

    return {
    	/*
    	 * Get current Session
    	 */
    	get: function (sessionId, property, cb) {
 			

            var filterProp = (typeof property === "string") ? property : false;

            cb = (typeof property === "function") ? property : cb;

 			var session = myCache.get(sessionId);

            session = (!filterProp) ? session : session[filterProp];

            if(typeof cb !== "undefined") {

                return cb(session);
            }

            return session;
    	},
    	/*
    	 * Set a new Session, if it already exists, update it
    	 */
    	set: function (sessionId, obj) {

            if(this.get(sessionId)) {

                return this.put(sessionId, obj);
            }

			return myCache.set(sessionId, obj);
    	},
    	/*
    	 * Update Session
    	 */
    	put: function (sessionId, objs) { 

    		var oldSession = this.get(sessionId);
            var newSession = Object.assign({}, oldSession, objs);

    		return myCache.set(sessionId, newSession);
    	}
    };
};

module.exports = Session;