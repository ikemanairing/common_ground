(function () {
  var STORAGE_KEY = 'common-ground-mobile-app-v1';
  var currentFile = window.location.pathname.split('/').pop() || '1.html';
  var routes = {
    '1.html': { next: '2.html', back: null },
    '2.html': { next: '3.html', back: '1.html' },
    '3.html': { next: '4.html', back: '2.html' },
    '4.html': { next: '5.html', back: '3.html' },
    '5.html': { next: '6.html', back: '4.html' },
    '6.html': { next: '7.html', back: '5.html' },
    '7.html': { next: '8.html', back: '6.html', finish: '10.html' },
    '8.html': { next: '9.html', back: '7.html' },
    '9.html': { next: '10.html', back: '8.html' },
    '10.html': { next: null, back: '9.html', finish: null }
  };

  var defaultState = {
    nickname: '',
    interests: [],
    topics: [],
    activity: '',
    agreement: false,
    answer1: '',
    peerName: '',
    peerAnswerMain: '',
    peerAnswerSub: '',
    emotion: '',
    summaryValue: '',
    summaryText: '',
    mission: '',
    completedAt: '',
    updatedAt: ''
  };

  var state = loadState();
  var HOVER_ACTIVE_ATTR = 'data-cg-hover-active';
  var INSPECTOR_UI_ATTR = 'data-cg-inspector-ui';
  var NON_INSPECTABLE_TAGS = {
    HTML: true,
    BODY: true,
    HEAD: true,
    SCRIPT: true,
    STYLE: true,
    META: true,
    LINK: true,
    TITLE: true,
    NOSCRIPT: true
  };
  var hoverInspector = {
    activeElement: null,
    pendingElement: null,
    rafId: null,
    labelElement: null
  };

  function normalize(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function findButtonByText(pattern, root) {
    return qsa('button', root).find(function (button) {
      return pattern.test(normalize(button.textContent));
    }) || null;
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return Object.assign({}, defaultState);
      }
      return Object.assign({}, defaultState, JSON.parse(raw));
    } catch (error) {
      return Object.assign({}, defaultState);
    }
  }

  function saveState(patch) {
    state = Object.assign({}, state, patch || {}, {
      updatedAt: new Date().toISOString()
    });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function isHoverInspectorEnabled() {
    try {
      var query = new URLSearchParams(window.location.search || '').get('cg_inspector');
      if (query === '1') {
        return true;
      }
      if (query === '0') {
        return false;
      }
      var persisted = window.localStorage.getItem('cg_inspector');
      if (persisted === '1') {
        return true;
      }
      if (persisted === '0') {
        return false;
      }
    } catch (error) {
      // [검사 스위치를 읽다가 실패해도 화면 동작은 유지하는 완충 처리] (우아한 실패 허용, Graceful Degradation)
    }

    return true;
  }

  function getInspectorSelector() {
    return [
      '[data-cg-label]',
      '[data-cg-id]',
      'button',
      'a[href]',
      'input',
      'select',
      'textarea',
      'summary',
      '[role="button"]',
      '[role="link"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
  }

  function toShortLabel(text, maxLength) {
    var value = normalize(text);
    if (!value) {
      return '';
    }
    if (value.length <= maxLength) {
      return value;
    }
    return value.slice(0, maxLength - 1) + '…';
  }

  function readInspectorLabel(element) {
    var fromCgLabel = toShortLabel(element.getAttribute('data-cg-label'), 64);
    if (fromCgLabel) {
      return fromCgLabel;
    }

    var fromAria = toShortLabel(element.getAttribute('aria-label'), 64);
    if (fromAria) {
      return fromAria;
    }

    var fromTitle = toShortLabel(element.getAttribute('title'), 64);
    if (fromTitle) {
      return fromTitle;
    }

    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      var fromField = toShortLabel(
        element.getAttribute('placeholder') || element.getAttribute('name') || '',
        64
      );
      if (fromField) {
        return fromField;
      }
    }

    var fromText = toShortLabel(element.textContent || '', 64);
    if (fromText) {
      return fromText;
    }

    var fromCgId = toShortLabel(element.getAttribute('data-cg-id'), 64);
    if (fromCgId) {
      return fromCgId;
    }

    return '<' + (element.tagName || 'element').toLowerCase() + '>';
  }

  function readInspectorId(element) {
    return normalize(element.getAttribute('data-cg-id') || '');
  }

  function findInspectableElement(target) {
    if (!target || target.nodeType !== 1) {
      return null;
    }

    function isInspectable(element) {
      if (!element || element.nodeType !== 1) {
        return false;
      }

      if (NON_INSPECTABLE_TAGS[element.tagName]) {
        return false;
      }

      if (element.closest('[' + INSPECTOR_UI_ATTR + '="true"]')) {
        return false;
      }

      return true;
    }

    var preferred = target.closest(getInspectorSelector());
    if (preferred && isInspectable(preferred)) {
      return preferred;
    }

    var cursor = target;
    while (cursor) {
      if (isInspectable(cursor)) {
        return cursor;
      }
      cursor = cursor.parentElement;
    }

    return null;
  }

  function ensureHoverInspectorStyle() {
    if (document.getElementById('cg-hover-inspector-style')) {
      return;
    }

    var style = document.createElement('style');
    style.id = 'cg-hover-inspector-style';
    style.textContent = [
      '[' + HOVER_ACTIVE_ATTR + '="true"] {',
      '  outline: 2px solid #ff8e3c !important;',
      '  outline-offset: 2px;',
      '  box-shadow: 0 0 0 3px rgba(255, 142, 60, 0.24) !important;',
      '}',
      '.cg-hover-layer {',
      '  pointer-events: none;',
      '  position: fixed;',
      '  inset: 0;',
      '  z-index: 2147483000;',
      '}',
      '.cg-hover-label {',
      '  display: none;',
      '  position: fixed;',
      '  max-width: min(320px, calc(100vw - 24px));',
      '  border-radius: 10px;',
      '  background: rgba(20, 24, 31, 0.96);',
      '  color: #f7f8fa;',
      '  padding: 8px 10px;',
      '  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.28);',
      '  border: 1px solid rgba(255, 255, 255, 0.14);',
      '}',
      '.cg-hover-label--above {',
      '  transform: translate(-50%, -100%);',
      '}',
      '.cg-hover-label--below {',
      '  transform: translate(-50%, 0);',
      '}',
      '.cg-hover-label__title {',
      '  margin: 0;',
      '  font-size: 12px;',
      '  line-height: 1.35;',
      '  font-weight: 700;',
      '}',
      '.cg-hover-label__id {',
      '  margin: 4px 0 0;',
      '  font-size: 11px;',
      '  line-height: 1.3;',
      '  color: #ffbd88;',
      '  word-break: break-word;',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }

  function ensureHoverInspectorLayer() {
    if (hoverInspector.labelElement) {
      return;
    }

    ensureHoverInspectorStyle();

    var layer = document.createElement('div');
    layer.className = 'cg-hover-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.setAttribute(INSPECTOR_UI_ATTR, 'true');

    var label = document.createElement('div');
    label.className = 'cg-hover-label cg-hover-label--above';

    var title = document.createElement('p');
    title.className = 'cg-hover-label__title';

    var id = document.createElement('p');
    id.className = 'cg-hover-label__id';

    label.appendChild(title);
    label.appendChild(id);
    layer.appendChild(label);
    document.body.appendChild(layer);

    hoverInspector.labelElement = label;
  }

  function syncHoverLabel(element) {
    if (!hoverInspector.labelElement) {
      return;
    }

    var labelElement = hoverInspector.labelElement;
    if (!element) {
      labelElement.style.display = 'none';
      return;
    }

    var rect = element.getBoundingClientRect();
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    var centerX = rect.left + rect.width / 2;
    var left = clamp(centerX, 16, Math.max(16, viewportWidth - 16));
    var placeBelow = rect.top < 72;
    var top = placeBelow ? rect.bottom + 8 : rect.top - 8;
    var titleText = readInspectorLabel(element);
    var idText = readInspectorId(element);
    var titleNode = labelElement.querySelector('.cg-hover-label__title');
    var idNode = labelElement.querySelector('.cg-hover-label__id');

    if (titleNode) {
      titleNode.textContent = titleText;
    }
    if (idNode) {
      idNode.textContent = idText;
      idNode.style.display = idText ? 'block' : 'none';
    }

    labelElement.classList.toggle('cg-hover-label--below', placeBelow);
    labelElement.classList.toggle('cg-hover-label--above', !placeBelow);
    labelElement.style.left = left + 'px';
    labelElement.style.top = top + 'px';
    labelElement.style.display = 'block';
  }

  function setActiveHoverElement(element) {
    if (hoverInspector.activeElement === element) {
      syncHoverLabel(element);
      return;
    }

    if (hoverInspector.activeElement) {
      hoverInspector.activeElement.removeAttribute(HOVER_ACTIVE_ATTR);
    }

    hoverInspector.activeElement = element;

    if (hoverInspector.activeElement) {
      hoverInspector.activeElement.setAttribute(HOVER_ACTIVE_ATTR, 'true');
    }

    syncHoverLabel(hoverInspector.activeElement);
  }

  function bindHoverInspector() {
    if (!isHoverInspectorEnabled()) {
      return;
    }

    ensureHoverInspectorLayer();

    function flushPendingElement() {
      hoverInspector.rafId = null;
      setActiveHoverElement(hoverInspector.pendingElement);
    }

    function scheduleFlush() {
      if (hoverInspector.rafId !== null) {
        return;
      }
      hoverInspector.rafId = window.requestAnimationFrame(flushPendingElement);
    }

    document.addEventListener('mousemove', function (event) {
      hoverInspector.pendingElement = findInspectableElement(event.target);
      scheduleFlush();
    }, { passive: true });

    document.addEventListener('mouseout', function (event) {
      if (!event.relatedTarget) {
        setActiveHoverElement(null);
      }
    }, { passive: true });

    document.addEventListener('focusin', function (event) {
      setActiveHoverElement(findInspectableElement(event.target));
    });

    function syncOnViewportChange() {
      if (hoverInspector.activeElement) {
        syncHoverLabel(hoverInspector.activeElement);
      }
    }

    window.addEventListener('resize', syncOnViewportChange);
    window.addEventListener('scroll', syncOnViewportChange, true);
  }

  function getRandomNickname() {
    var words = ['새싹', '햇살', '달빛', '바람', '물결', '하늘', '숲길', '연결', '마음', '소다'];
    var number = Math.floor(Math.random() * 90) + 10;
    return words[Math.floor(Math.random() * words.length)] + number;
  }

  function initStep1() {
    var nameNode = document.querySelector('h4');
    if (!nameNode) {
      return;
    }
    if (!state.nickname) {
      saveState({ nickname: normalize(nameNode.textContent) || getRandomNickname() });
    }
    nameNode.textContent = state.nickname;

    var rerollButtons = qsa('button').filter(function (button) {
      var icon = button.querySelector('.material-symbols-outlined');
      return /다시 뽑기/.test(normalize(button.textContent)) || (icon && normalize(icon.textContent) === 'autorenew');
    });
    rerollButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        var nextName = getRandomNickname();
        nameNode.textContent = nextName;
        saveState({ nickname: nextName });
      });
    });
  }

  function getInterestButtons() {
    return qsa('details button');
  }

  function getInterestLabel(button) {
    var iconTexts = qsa('.material-symbols-outlined', button).map(function (node) {
      return normalize(node.textContent);
    });
    var spans = qsa('span', button).map(function (node) {
      return normalize(node.textContent);
    }).filter(function (text) {
      return text && iconTexts.indexOf(text) === -1;
    });
    if (spans.length) {
      return spans[0];
    }
    return normalize(button.textContent).replace(/check/g, '').trim();
  }

  function renderInterestButton(button, selected) {
    button.dataset.selected = selected ? 'true' : 'false';
    button.classList.toggle('bg-warm-primary', selected);
    button.classList.toggle('text-white', selected);
    button.classList.toggle('shadow-md', selected);
    button.classList.toggle('shadow-warm-primary/30', selected);
    button.classList.toggle('border', !selected);
    button.classList.toggle('border-warm-border/50', !selected);
    button.classList.toggle('bg-white', !selected);

    var checkIcon = qsa('.material-symbols-outlined', button).find(function (node) {
      return normalize(node.textContent) === 'check';
    });
    if (selected && !checkIcon) {
      var icon = document.createElement('span');
      icon.className = 'material-symbols-outlined text-[16px]';
      icon.textContent = 'check';
      icon.setAttribute('data-generated', 'true');
      button.appendChild(icon);
    }
    if (!selected && checkIcon) {
      checkIcon.remove();
    }
  }

  function renderInterestFooter(selectedList) {
    var label = qsa('p').find(function (node) {
      return /선택된 태그/.test(normalize(node.textContent));
    });
    if (label) {
      label.textContent = '선택된 태그 (' + selectedList.length + ')';
    }

    var chipsContainer = document.querySelector('.hide-scrollbar.pb-2');
    if (!chipsContainer) {
      return;
    }
    chipsContainer.innerHTML = '';
    selectedList.forEach(function (name) {
      var chip = document.createElement('div');
      chip.className = 'flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-warm-secondary/40 pl-3 pr-2 border border-warm-border/30';
      chip.innerHTML = '<p class="text-warm-text text-xs font-semibold"></p>' +
        '<button type="button" class="rounded-full hover:bg-warm-secondary/60 p-0.5" aria-label="remove tag">' +
        '<span class="material-symbols-outlined text-[14px]">close</span></button>';
      chip.querySelector('p').textContent = name;
      chip.querySelector('button').addEventListener('click', function () {
        var nextList = (state.interests || []).filter(function (value) {
          return value !== name;
        });
        saveState({ interests: nextList });
        initStep2();
      });
      chipsContainer.appendChild(chip);
    });

    var remain = Math.max(0, 7 - selectedList.length);
    var placeholder = document.createElement('div');
    placeholder.className = 'flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full border border-dashed border-warm-border pl-3 pr-3 bg-white/50';
    placeholder.innerHTML = '<p class="text-warm-text-light text-xs font-medium italic"></p>';
    placeholder.querySelector('p').textContent = remain > 0 ? remain + '개 더 선택해주세요...' : '충분히 선택했어요!';
    chipsContainer.appendChild(placeholder);

    var percent = Math.max(20, Math.min(100, selectedList.length * 10));
    var percentNode = qsa('span').find(function (node) {
      return /%$/.test(normalize(node.textContent));
    });
    if (percentNode) {
      percentNode.textContent = percent + '%';
    }
    var bar = document.querySelector('.h-full.rounded-full.bg-warm-primary');
    if (bar) {
      bar.style.width = percent + '%';
    }
  }

  function initStep2() {
    var selected = (state.interests || []).slice();
    var buttons = getInterestButtons();
    if (!selected.length) {
      selected = buttons.filter(function (button) {
        return button.classList.contains('bg-warm-primary');
      }).map(getInterestLabel);
      saveState({ interests: selected });
    }
    var selectedSet = new Set(selected);

    buttons.forEach(function (button) {
      var label = getInterestLabel(button);
      button.type = 'button';
      button.dataset.interestLabel = label;
      renderInterestButton(button, selectedSet.has(label));
      button.onclick = function (event) {
        event.preventDefault();
        var latestSet = new Set(state.interests || []);
        if (latestSet.has(label)) {
          latestSet.delete(label);
        } else {
          latestSet.add(label);
        }
        saveState({ interests: Array.from(latestSet) });
        initStep2();
      };
    });

    renderInterestFooter(Array.from(selectedSet));
  }

  function getTopicButtons() {
    var sections = qsa('main section');
    if (!sections[0]) {
      return [];
    }
    return qsa('button', sections[0]);
  }

  function getActivityButtons() {
    var sections = qsa('main section');
    if (!sections[1]) {
      return [];
    }
    return qsa('.grid button', sections[1]);
  }

  function getTopicLabel(button) {
    var span = button.querySelector('span');
    return normalize((span && span.textContent) || button.textContent).replace(/check/g, '').trim();
  }

  function getActivityLabel(button) {
    var title = button.querySelector('h3');
    return normalize((title && title.textContent) || button.textContent);
  }

  function renderSelectionOutline(button, selected) {
    button.dataset.selected = selected ? 'true' : 'false';
    button.classList.toggle('ring-2', selected);
    button.classList.toggle('ring-primary', selected);
  }

  function initStep3() {
    var topicButtons = getTopicButtons();
    var activityButtons = getActivityButtons();
    var topics = new Set(state.topics || []);

    if (!topics.size) {
      topicButtons.forEach(function (button) {
        if (button.classList.contains('border-2') && button.classList.contains('border-primary')) {
          topics.add(getTopicLabel(button));
        }
      });
      saveState({ topics: Array.from(topics) });
    }

    topicButtons.forEach(function (button) {
      var label = getTopicLabel(button);
      button.type = 'button';
      renderSelectionOutline(button, topics.has(label));
      button.addEventListener('click', function (event) {
        event.preventDefault();
        if (topics.has(label)) {
          topics.delete(label);
        } else {
          topics.add(label);
        }
        var next = Array.from(topics);
        saveState({ topics: next });
        renderSelectionOutline(button, topics.has(label));
      });
    });

    var activity = state.activity;
    if (!activity && activityButtons.length) {
      var selectedButton = activityButtons.find(function (button) {
        return button.classList.contains('border-2') && button.classList.contains('border-primary');
      });
      if (selectedButton) {
        activity = getActivityLabel(selectedButton);
        saveState({ activity: activity });
      }
    }
    activityButtons.forEach(function (button) {
      button.type = 'button';
      var label = getActivityLabel(button);
      renderSelectionOutline(button, label === activity);
      button.addEventListener('click', function (event) {
        event.preventDefault();
        activityButtons.forEach(function (item) {
          renderSelectionOutline(item, false);
        });
        renderSelectionOutline(button, true);
        saveState({ activity: label });
      });
    });
  }

  function initStep4() {
    var agreeCheck = document.getElementById('agree-check');
    var startButton = document.getElementById('start-btn');
    if (!agreeCheck || !startButton) {
      return;
    }
    agreeCheck.checked = Boolean(state.agreement);
    agreeCheck.dispatchEvent(new Event('change', { bubbles: true }));
    agreeCheck.addEventListener('change', function () {
      saveState({ agreement: agreeCheck.checked });
    });
  }

  function initStep5() {
    var textarea = document.querySelector('textarea');
    if (!textarea) {
      return;
    }
    var counter = qsa('div').find(function (node) {
      return /\/\s*100$/.test(normalize(node.textContent));
    });
    textarea.maxLength = 100;
    if (state.answer1) {
      textarea.value = state.answer1;
    }
    var syncCount = function () {
      var text = textarea.value || '';
      if (counter) {
        counter.textContent = text.length + ' / 100';
      }
      saveState({ answer1: text });
    };
    textarea.addEventListener('input', syncCount);
    syncCount();
  }

  function ensurePeerAnswer() {
    var peerName = state.peerName || ('A' + (Math.floor(Math.random() * 90) + 10));
    var main = state.peerAnswerMain;
    var sub = state.peerAnswerSub;

    if (!main || !sub) {
      if ((state.interests || []).some(function (item) { return /축구|농구|운동|수영/.test(item); })) {
        main = '"축구 하이라이트 모음"';
        sub = '경기 영상을 보면 에너지가 생겨요';
      } else if ((state.interests || []).some(function (item) { return /게임/.test(item); })) {
        main = '"요즘 인기 게임 스트리밍"';
        sub = '친구랑 같이 보면 더 재밌어요';
      } else if ((state.interests || []).some(function (item) { return /음악|케이팝/.test(item); })) {
        main = '"좋아하는 가수의 라이브 영상"';
        sub = '가사가 공감돼서 자주 들어요';
      } else {
        main = '"최근 재미있게 본 드라마 1편"';
        sub = '캐릭터가 매력적이라 몰입해서 봤어요';
      }
    }

    saveState({
      peerName: peerName,
      peerAnswerMain: main,
      peerAnswerSub: sub
    });
  }

  function initStep6() {
    ensurePeerAnswer();
    var cards = qsa('.glass-card');
    if (cards.length < 2) {
      return;
    }
    var myMain = cards[0].querySelector('p');
    var mySub = cards[0].querySelector('.mt-3 p');
    var peerMain = cards[1].querySelector('p');
    var peerSub = cards[1].querySelector('.mt-3 p');
    if (myMain) {
      myMain.textContent = '"' + (state.answer1 || '아직 답변을 작성하지 않았어요') + '"';
    }
    if (mySub) {
      mySub.textContent = state.answer1 ? '내가 직접 적은 답변이에요' : '이전 화면에서 답변을 입력하면 여기에 반영돼요';
    }
    var peerLabel = qsa('span').find(function (node) {
      return /님의 답변/.test(normalize(node.textContent));
    });
    if (peerLabel) {
      peerLabel.textContent = state.peerName + '님의 답변';
    }
    if (peerMain) {
      peerMain.textContent = state.peerAnswerMain;
    }
    if (peerSub) {
      peerSub.textContent = state.peerAnswerSub;
    }
  }

  function initStep7() {
    var titleNode = qsa('h1').find(function (node) {
      return /어색함/.test(normalize(node.textContent));
    }) || document.querySelector('main h1');
    if (titleNode) {
      titleNode.textContent = '오늘 어색함이 조금은 줄었어?';
      ensureStep7TitleFadeStyle();
      titleNode.classList.add('cg-step7-title-fade-in');
    }

    var bodyText = qsa('p').find(function (node) {
      return /작은 대답들이/.test(normalize(node.textContent));
    });
    if (!bodyText) {
      return;
    }
    var info = [];
    if (state.nickname) {
      info.push('닉네임: ' + state.nickname);
    }
    if (state.interests && state.interests.length) {
      info.push('관심사 ' + state.interests.length + '개 선택');
    }
    if (state.answer1) {
      info.push('내 답변 저장 완료');
    }
    bodyText.innerHTML = info.length ? info.join('<br/>') : '지금까지 저장된 기록을 바탕으로 마무리 단계를 진행해요.';
  }

  function ensureStep7TitleFadeStyle() {
    if (document.getElementById('cg-step7-title-fade-style')) {
      return;
    }

    var style = document.createElement('style');
    style.id = 'cg-step7-title-fade-style';
    style.textContent = [
      '@keyframes cg-step7-title-fade-in {',
      '  0% {',
      '    opacity: 0;',
      '    transform: translateY(10px);',
      '    filter: blur(6px);',
      '  }',
      '  60% {',
      '    opacity: 0.45;',
      '    transform: translateY(4px);',
      '    filter: blur(3px);',
      '  }',
      '  100% {',
      '    opacity: 1;',
      '    transform: translateY(0);',
      '    filter: blur(0);',
      '  }',
      '}',
      '.cg-step7-title-fade-in {',
      '  opacity: 0;',
      '  animation: cg-step7-title-fade-in 4200ms ease-out forwards;',
      '}',
      '@media (prefers-reduced-motion: reduce) {',
      '  .cg-step7-title-fade-in {',
      '    opacity: 1;',
      '    animation: none;',
      '  }',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }

  function initStep8() {
    var labels = qsa('form label');
    labels.forEach(function (label) {
      var input = label.querySelector('input[type="radio"]');
      var text = label.querySelector('span');
      if (!input || !text) {
        return;
      }
      var value = normalize(text.textContent);
      input.value = value;
      input.checked = state.emotion === value || input.checked;
      input.addEventListener('change', function () {
        if (input.checked) {
          saveState({ emotion: value });
        }
      });
    });
  }

  function initStep9() {
    var labels = qsa('form label');
    labels.forEach(function (label) {
      var input = label.querySelector('input[type="radio"]');
      var sentence = label.querySelector('p');
      if (!input || !sentence) {
        return;
      }
      var sentenceText = normalize(sentence.textContent);
      if (state.summaryValue === input.value || state.summaryText === sentenceText) {
        input.checked = true;
      }
      input.addEventListener('change', function () {
        if (input.checked) {
          saveState({
            summaryValue: input.value,
            summaryText: sentenceText
          });
        }
      });
    });
  }

  function initStep10() {
    var detailsList = qsa('main details');
    if (!detailsList.length) {
      return;
    }
    detailsList.forEach(function (details) {
      var summary = details.querySelector('summary');
      var missionNode = details.querySelector('summary p');
      if (!summary || !missionNode) {
        return;
      }
      var missionText = normalize(missionNode.textContent);
      if (state.mission && state.mission === missionText) {
        details.open = true;
      }
      summary.addEventListener('click', function (event) {
        event.preventDefault();
        detailsList.forEach(function (item) {
          item.open = false;
          item.classList.remove('ring-2', 'ring-primary');
        });
        details.open = true;
        details.classList.add('ring-2', 'ring-primary');
        saveState({ mission: missionText });
      });
    });
  }

  function syncStateFromDOM() {
    if (currentFile === '4.html') {
      var agreeCheck = document.getElementById('agree-check');
      if (agreeCheck) {
        saveState({ agreement: agreeCheck.checked });
      }
    }
    if (currentFile === '5.html') {
      var textarea = document.querySelector('textarea');
      if (textarea) {
        saveState({ answer1: textarea.value || '' });
      }
    }
    if (currentFile === '8.html') {
      var checkedEmotion = document.querySelector('form input[type="radio"]:checked');
      if (checkedEmotion) {
        saveState({ emotion: checkedEmotion.value });
      }
    }
    if (currentFile === '9.html') {
      var checkedSummary = document.querySelector('form input[type="radio"]:checked');
      if (checkedSummary) {
        var label = checkedSummary.closest('label');
        var sentence = label ? label.querySelector('p') : null;
        saveState({
          summaryValue: checkedSummary.value,
          summaryText: normalize(sentence && sentence.textContent)
        });
      }
    }
  }

  function validateMove(action) {
    if (action === 'back') {
      return { ok: true };
    }
    if (currentFile === '2.html' && action === 'next') {
      if (!state.interests || state.interests.length < 3) {
        return { ok: false, message: '관심사를 최소 3개 선택해주세요.' };
      }
    }
    if (currentFile === '3.html' && action === 'next') {
      if (!state.activity) {
        return { ok: false, message: '같이 해보고 싶은 활동 1개를 골라주세요.' };
      }
    }
    if (currentFile === '4.html' && action === 'next') {
      if (!state.agreement) {
        return { ok: false, message: '약속 확인 체크를 먼저 해주세요.' };
      }
    }
    if (currentFile === '5.html' && action === 'next') {
      if (!normalize(state.answer1)) {
        return { ok: false, message: '답변을 한 줄 이상 입력해주세요.' };
      }
    }
    if (currentFile === '9.html' && action === 'next') {
      if (!state.summaryValue) {
        return { ok: false, message: '오늘의 문장을 하나 선택해주세요.' };
      }
    }
    if (currentFile === '10.html' && action === 'finish') {
      if (!state.mission) {
        return { ok: false, message: '내일 미션을 하나 선택해주세요.' };
      }
    }
    return { ok: true };
  }

  function bindNavigation() {
    document.addEventListener('click', function (event) {
      var control = event.target.closest('[data-nav]');
      if (!control || !document.contains(control)) {
        return;
      }
      event.preventDefault();
      if (control.disabled || control.getAttribute('aria-disabled') === 'true') {
        return;
      }

      syncStateFromDOM();
      var action = control.getAttribute('data-nav');
      if (action !== 'next' && action !== 'back' && action !== 'finish') {
        return;
      }
      var validation = validateMove(action);
      if (!validation.ok) {
        alert(validation.message);
        return;
      }

      var route = routes[currentFile] || {};
      var target = route[action] || null;
      if (action === 'finish' && !target) {
        saveState({ completedAt: new Date().toISOString() });
        alert(
          '모바일 여정이 완료되었습니다!\n\n' +
          '닉네임: ' + (state.nickname || '-') + '\n' +
          '감정: ' + (state.emotion || '-') + '\n' +
          '내일 미션: ' + (state.mission || '-')
        );
        return;
      }
      if (target) {
        window.location.href = target;
      }
    });
  }

  function init() {
    // 화면마다 필요한 준비를 붙이는 부품 조립 단계 (초기화, Initialization)
    bindHoverInspector();

    if (currentFile === '1.html') {
      initStep1();
    } else if (currentFile === '2.html') {
      initStep2();
    } else if (currentFile === '3.html') {
      initStep3();
    } else if (currentFile === '4.html') {
      initStep4();
    } else if (currentFile === '5.html') {
      initStep5();
    } else if (currentFile === '6.html') {
      initStep6();
    } else if (currentFile === '7.html') {
      initStep7();
    } else if (currentFile === '8.html') {
      initStep8();
    } else if (currentFile === '9.html') {
      initStep9();
    } else if (currentFile === '10.html') {
      initStep10();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  bindNavigation();
})();
