var gulp = require('gulp'),
    watch = require('gulp-watch'),
    babel = require('gulp-babel'),
    babel_config = require('./package').babel,
    gutil = require('gulp-util');


gulp.task('watch', function(){
    watch('src/*.js', { usePolling: true }, function () {
      gutil.log('file changes');
      gulp.src('src/**/*.js').pipe(babel(babel_config))
          .pipe(gulp.dest('lib'));
    });
});

gulp.task('default', ['watch']);
