'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const shell = require('gulp-shell');

gulp.task('sass', function() {
  return gulp.src('../src/sass/main.sass')
    .pipe(sass({
      includePaths: ['node_modules/bulma/', 'node_modules/bulma/sass/']
    }).on('error', sass.logError))
    .pipe(gulp.dest('../css'));
});
