/* eslint-disable */
import Vue from 'vue'
import Vuex from 'vuex'
import router from './routes'
import fbase from './fbase'

const debug = require('debug')('cl8.store')

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    loading: true,
    searchTerm: "",
    searchTags: [],
    profile: null
  },
  getters: {
    currentUser: function (state) {
      return state.user
    },
    isLoading: function (state) {
      return state.loading
    },
    currentTerm: function (state) {
      return state.searchTerm
    },
    activeTags: function (state) {
      debug('activeTags', state.searchTags)
      return state.searchTags
    },
    profile: function (state) {
      return state.profile
    }
  },
  mutations: {
    stopLoading: function (state) {
      state.loading = false
    },
    setFBUser: function (state) {
      debug('setFBUser', state.user)
      const user = fbase.auth().currentUser
      if (user) {
        state.user = user.toJSON()
        debug('setFBUser - state user', state.user)
      }
    },
    clearFBUser: function (state) {
      debug('clearFBUser', state.user)
      state.user = null
    },
    setTerm: function (state, payload) {
      debug('setTerm', payload)
      state.searchTerm = payload
    },
    setTags: function (state, payload) {
      debug('setTags', payload)
      state.searchTags = payload
    },
    setProfile: function (state, payload) {
      debug('setProfile', payload)
      state.profile = payload
    }
  },
  actions: {
    autoLogin: function (context) {
      context.commit('setFBUser')
      // check if firebase has a user when we intialise it.
      debug('autoLogin', context.state)
    },
    // otherwise log user in here
    login: function (context, payload) {
      debug(payload)
      fbase.auth()
        .signInWithEmailAndPassword(payload.email, payload.password)
        .then(
          user => {
            debug(user)
            context.commit('setFBUser', user)
          },
          error => {
            alert(error.message);
          }
        )
    },
    logout: function (context) {
      fbase.auth().signOut().then(function() {
        // Sign-out successful.
        context.commit('clearFBUser')
      }).catch(function(error) {
        // An error happened
        debug('Logout Failed!', error)
      })
    },
    resetPassword: function (context, payload) {
      debug('send password reset for ', payload)
      fbase.auth().sendPasswordResetEmail(payload).then(function() {
        // Email sent.
        debug('password reset requested', payload)
      }).catch(function(error) {
      // An error happened.
        debug('Problem sending password: ', error)
      });
    },
    updateActiveTags: function (context, payload) {
      debug('updateActiveTags', payload)
      let tag = payload
      let tags = context.state.searchTags
      debug('tags', tags)
      if (tags.indexOf(tag) !== -1) {
        let index = tags.indexOf(tag)
        tags.splice(index, 1)
      } else {
        tags.push(tag)
      }
      context.commit('setTags', tags)
    },
    updateProfile: function (context, payload) {
      debug('sending update to Firebase', payload)

      // not super happy about this - surely there's a toJSON() method?
      let newProfile = JSON.parse(JSON.stringify(payload))
      delete newProfile['.key']
      fbase.database().ref('userlist').child(payload['.key']).set(newProfile)
        .then(() => {
          debug('Succesfully saved')
          router.push('/home')
        })
        .catch(error => {
          debug('Saving profile: ', payload , 'failed', error)
        })
    }
  }
})
