const sharp = require("sharp");
const got = require("got");

const Parse = require("parse/node");
Parse.initialize(
  "lXvBldv67vAjDQjzkxAyxywO8CUhEjpllDbzFg5n",
  "SEQ5YwrhmmbTYOaL7bL80KxTYp7eXQ96kcHtTCix"
);
Parse.serverURL = "https://parseapi.back4app.com/";
Parse.masterKey = "fFxu1wKQlC69ktCZmrtk3RjWTl0ccb4rrVzCja6c";

exports.handler = (event) => {
  let Wallpapers = Parse.Object.extend("Wallpapers");
  let query = new Parse.Query(Wallpapers);
  query.equalTo("thumbnail", undefined);
  query
    .find()
    .then((wallpapers) => {
      wallpapers.forEach((wallpaper, index) => {
        let phoneImage = wallpaper.get("phone");
        let thumbName = "thumb_" + phoneImage.name();
        let sharpStream = sharp({
          failOnError: false,
        });
        try {
          got.stream(phoneImage.url()).pipe(sharpStream);
          sharpStream
            .clone()
            .resize({ width: 273, height: 205 })
            .toBuffer()
            .then((res) => {
              let base64String = `data:image/png;base64,${res.toString(
                "base64"
              )}`;
              let thumb = new Parse.File(thumbName, { base64: base64String });
              wallpaper.set("thumbnail", thumb);
              wallpaper.save(null, { useMasterKey: true }).then(
                (response) => {
                  console.log("Updated Categories", response);
                },
                (error) => {
                  console.error("Error while updating Categories", error);
                }
              );
            })
            .catch((err) => {
              console.error("Error processing files, let's clean it up", err);
            });
        } catch (err) {
          console.log(err);
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
