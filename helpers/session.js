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

    		var currentSession = this.get(sessionId);
            var newSession = Object.assign({}, currentSession, objs);

            for (var prop in objs)
                if (prop in currentSession)
                    currentSession[prop] = Object.assign({}, currentSession[prop], objs[prop]);
                else
                    currentSession[prop] = objs[prop];

    		return myCache.set(sessionId, currentSession);
    	},

        del: function (sessionId, prop, cb) {

            return myCache.del(sessionId, prop, function () {

                if(typeof cb === "function") cb();
            });
        }
    };
};

module.exports = Session;