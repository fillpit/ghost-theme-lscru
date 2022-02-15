import $ from 'jquery';
import mediumZoom from 'medium-zoom';
import fitvids from 'fitvids';
import shave from 'shave';
import Swiper, { Navigation, A11y } from 'swiper';

import {
  isMobile,
  adjustImageGallery,
  managePostImages,
  makeImagesZoomable
} from './helpers';

let $aosWrapper = null;
let $progressCircle = null;
let lastScrollingY = window.pageYOffset;
let lastWindowHeight = 0;
let lastDocumentHeight = 0;
let circumference = 0;
let isTicking = false;

const onScrolling = () => {
  lastScrollingY = window.pageYOffset;
  requestTicking();
};

const adjustShare = timeout => {
  if (!isMobile('1023px')) {
    $('body').removeClass('share-menu-displayed');
  } else {
    $('body').addClass('share-menu-displayed');
    setTimeout(() => {
      $aosWrapper.removeAttr('data-aos');
    }, timeout);
  }
};

const onResizing = () => {
  setHeights();
  adjustShare(100);

  setTimeout(() => {
    setCircleStyles();
    requestTicking();
  }, 200);
};

const requestTicking = () => {
  if (!isTicking) {
    requestAnimationFrame(updating);
  }

  isTicking = true;
};

const updating = () => {
  const progressMax = lastDocumentHeight - lastWindowHeight;
  const percent = Math.ceil((lastScrollingY / progressMax) * 100);

  if (percent <= 100) {
    setProgress(percent);
  }

  isTicking = false;
};

const setHeights = () => {
  lastWindowHeight = window.innerHeight;
  lastDocumentHeight = $(document).height();
};

const setCircleStyles = () => {
  const svgWidth = $progressCircle.parent().width();
  const radiusCircle = svgWidth / 2;
  const borderWidth = isMobile() ? 2 : 3;

  $progressCircle.parent().attr('viewBox', `0 0 ${svgWidth} ${svgWidth}`);
  $progressCircle.attr('stroke-width', borderWidth);
  $progressCircle.attr('r', radiusCircle - (borderWidth - 1));
  $progressCircle.attr('cx', radiusCircle);
  $progressCircle.attr('cy', radiusCircle);

  circumference = radiusCircle * 2 * Math.PI;

  $progressCircle[0].style.strokeDasharray = `${circumference} ${circumference}`;
  $progressCircle[0].style.strokeDashoffset = circumference;
};

const setProgress = percent => {
  if (percent <= 100) {
    const offset = circumference - (percent / 100) * circumference;
    $progressCircle[0].style.strokeDashoffset = offset;
  }
};

const prepareProgressCircle = () => {
  $progressCircle = $('.js-progress');

  setHeights();
  setCircleStyles();
  updating();

  setTimeout(() => {
    $progressCircle.parent().css('opacity', 1);
  }, 300);
};

const copyCode = (target) => {
  var copy_text = $(target).nextAll('code').text();
  copy(copy_text)

  $(target).text('已复制');
  $(target).attr('title', "代码已成功复制").tooltip('fixTitle').tooltip('show');
}

$(() => {
  $aosWrapper = $('.js-aos-wrapper');
  const $scrollButton = $('.js-scrolltop');
  const $recommendedSlider = $('.js-recommended-slider');

  fitvids('.js-post-content');

  adjustImageGallery();
  adjustShare(1000);

  if ($recommendedSlider.length > 0) {
    const recommendedSwiper = new Swiper('.js-recommended-slider', {
      modules: [Navigation, A11y],
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      slidesPerView: 1,
      allowTouchMove: true,
      loop: true,
      a11y: true,
      breakpoints: {
        720: {
          slidesPerView: 2,
          allowTouchMove: true,
          loop: true
        },
        1024: {
          slidesPerView: 3,
          allowTouchMove: false,
          loop: false
        }
      },
      on: {
        init: function() {
          shave('.js-article-card-title', 100);
          shave('.js-article-card-title-no-image', 250);
        }
      }
    });
  }

  shave('.js-article-card-title', 100);
  shave('.js-article-card-title-no-image', 250);

  $scrollButton.on('click', () => {
    $('html, body').animate(
      {
        scrollTop: 0
      },
      500
    );
  });

  // 代码复制按钮
  $pre.on('mouseover', function () {
    var div_copy_code = "<a data-toggle='tooltip' data-placement='right' title='点击复制代码' class='copy-code-wrapper'>复制</a>";
      if ($(this).children('.copy-code-wrapper').length <= 0) {
        $(div_copy_code).prependTo($(this));
        var top = $(this).offset().top,
          left = $(this).offset().left + $(this).outerWidth() - $(this).children('.copy-code-wrapper').outerWidth();
        $(this).children('.copy-code-wrapper').offset({
          'top': top,
          'left': left
        });
        $(this).children('.copy-code-wrapper').tooltip();
      }
  }).on('mouseleave', function() {
    $(this).children('.copy-code-wrapper').remove();
  })
  // 代码复制点击
  $pre.on('click', 'a', function() {
    copyCode(this)
  })

  managePostImages($)
  makeImagesZoomable($, mediumZoom)

  window.addEventListener('scroll', onScrolling, { passive: true });
  window.addEventListener('resize', onResizing, { passive: true });
});

$(window).on('load', () => {
  prepareProgressCircle();
});
