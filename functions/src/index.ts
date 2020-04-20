import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
const firebase_tools = require('firebase-tools');

admin.initializeApp(functions.config().firebase);

export const joinGame = functions.https.onCall((data, context) => {
  //Check that game actually exists, and that the state is still player joining
  return admin.firestore().collection('G').doc(data.G).get().then((game) => {
    if (!game.exists) {
      return {error: 50};
    } else {
      const gameData = game.data();
      if(gameData) {
        if (gameData.S == 1) {
          return admin.firestore().collection('G').doc(data.G).collection('P').where('N', '==', data.P.N).get().then((snapshot) => {
            if (snapshot.empty) {
              return admin.firestore().collection('G').doc(data.G).collection('P').add(data.P).then((player) => {
                return admin.firestore().collection('G').doc(data.G).collection('P').doc(player.id).collection('L').doc('S').set({R: 1, P: 0}).then(() => {
                  return {uuid: player.id};
                }).catch(() => {
                  return {error: 40};
                });
              }).catch((error) => {
                return {error: 30};
              });
            } else {
              return {error: 20};
            }
          }).catch((error) => {
            console.log('Error joinGame', error);
            return {error: 10};
          });
        } else {
          return {error: 60};
        }
      } else {
        return {error: 70};
      }
    }
  }).catch(err => {
    return {error: 80};
  });

});

export const deleteGame = functions.runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  }).https.onCall((data) => {
    return firebase_tools.firestore
      .delete('G/' + data.P, {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true
      })
      .then(() => {
        return {deleted: true};
      });
});

exports.deleteQuiz = functions.runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  }).firestore.document('Q/{quizId}/U/{userId}')
    .onDelete(async (userSnap, context) => {
      return admin.firestore().collection('Q').doc(context.params.quizId)
      .collection('U').select().get().then(
        (usersSnap) => {
          if (usersSnap.docs.length < 1) {
            return firebase_tools.firestore
              .delete('Q/' + context.params.quizId, {
                project: process.env.GCLOUD_PROJECT,
                recursive: true,
                yes: true
            }).then(() =>  {
              return admin.storage().bucket().deleteFiles({
                prefix: 'Q/' + context.params.quizId
              });
            });
          }
        }).catch((error) => {
          console.log(error);
        });
    });

exports.deleteQuestionFiles = functions.runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  }).firestore.document('Q/{quizId}/Q/{questionId}')
    .onDelete(async (questionSnap, context) => {
        return admin.storage().bucket().deleteFiles({
          prefix: 'Q/' + context.params.quizId + '/Q/' + context.params.questionId
        });
    });

  exports.deleteUser = functions.runWith({
      timeoutSeconds: 540,
      memory: '2GB'
    }).auth.user()
    .onDelete((user) => {
      return admin.firestore().collection('U').doc(user.uid)
      .collection('Q').select().get().then(
        (userQuizsSnap) => {
        const batch = admin.firestore().batch();

        for (const quizRef of userQuizsSnap.docs) {
          const quizUserRef = admin.firestore().collection('Q').doc(quizRef.id).collection('U').doc(user.uid);
          batch.delete(quizUserRef);

          const userQuizRef = admin.firestore().collection('U').doc(user.uid).collection('Q').doc(quizRef.id);
          batch.delete(userQuizRef);
        }

        return batch.commit().then(() => {
            return admin.firestore().collection('U').doc(user.uid).delete().then(() => {
              return admin.storage().bucket().deleteFiles({
                prefix: 'U/' + user.uid
              });
            }).catch((error) => {
              console.log(error);
            });
        });
      }).catch((error) => {
        console.log(error);
      });
    });

//Next functions has been disabled to make less function calls.
/*exports.deleteQuizFiles = functions.firestore
  .document('Q/{quizId}')
  .onDelete(async (snap, context) => {
    return admin.storage().bucket().deleteFiles({
      prefix: 'Q/' + context.params.quizId
    });
  });
*/

//Next functions has been disabled to make less function calls.
/*exports.deleteUserFiles = functions.firestore
  .document('U/{userId}')
  .onDelete(async (snap, context) => {
    return admin.storage().bucket().deleteFiles({
      prefix: 'U/' + context.params.userId
    });
  });
*/
