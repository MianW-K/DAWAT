// JavaScript block 1
(function () {
      var $ = function (i) {
        return document.getElementById(i);
      };
      var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      var opened = false;

      /* Particles */
      var cv = $("fx"),
        cx = cv.getContext("2d"),
        P = [],
        run = false;
      function size() {
        var d = window.devicePixelRatio || 1;
        cv.width = innerWidth * d;
        cv.height = innerHeight * d;
        cx.setTransform(d, 0, 0, d, 0, 0);
      }
      size();
      addEventListener("resize", size);
      function burst(x, y, n, petal) {
        if (reduce) n = Math.min(n, 4);
        for (var i = 0; i < n; i++) {
          var a = Math.random() * 6.283,
            s = petal ? 1.5 + Math.random() * 4 : 2 + Math.random() * 6;
          P.push({
            x: x,
            y: y,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s - (petal ? 3 : 0),
            r: petal ? 5 + Math.random() * 5 : 1.5 + Math.random() * 2.5,
            rot: Math.random() * 6,
            vr: (Math.random() - 0.5) * 0.2,
            l: 1,
            petal: petal,
            c: petal
              ? Math.random() < 0.5
                ? "#e8768c"
                : "#f7b6c2"
              : "#f4cf7a",
          });
        }
        if (!run) {
          run = true;
          requestAnimationFrame(loop);
        }
      }
      function loop() {
        cx.clearRect(0, 0, innerWidth, innerHeight);
        P = P.filter(function (p) {
          return p.l > 0;
        });
        P.forEach(function (p) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.petal ? 0.07 : 0.12;
          p.vx *= 0.985;
          p.rot += p.vr;
          p.l -= p.petal ? 0.007 : 0.018;
          cx.save();
          cx.globalAlpha = Math.max(p.l, 0);
          cx.fillStyle = p.c;
          cx.translate(p.x, p.y);
          cx.rotate(p.rot);
          cx.beginPath();
          if (p.petal) cx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 6.283);
          else {
            cx.moveTo(0, -p.r * 2);
            cx.lineTo(p.r, 0);
            cx.lineTo(0, p.r * 2);
            cx.lineTo(-p.r, 0);
          }
          cx.fill();
          cx.restore();
        });
        if (P.length) requestAnimationFrame(loop);
        else run = false;
      }
      document.addEventListener("pointerdown", function (e) {
        if (!opened || e.target.closest("button,a,input")) return;
        burst(e.clientX, e.clientY, 10, true);
      });

      /* Tap the wax seal to reveal the invitation card. */
      var stage = $("stage"),
        introVideo = $("intro-video"),
        cardScreen = $("intro-card-screen"),
        sealTrigger = $("open-seal"),
        enterInvitation = $("enter-invitation"),
        introStarted = false;
      function revealCard() {
        if (opened) return;
        introVideo.pause();
        cardScreen.setAttribute("aria-hidden", "false");
        stage.classList.add("card-revealed");
        enterInvitation.focus({ preventScroll: true });
      }
      function playEnvelope() {
        if (introStarted || opened) return;
        introStarted = true;
        sealTrigger.disabled = true;
        stage.classList.add("opening");
        introVideo.currentTime = 0;
        var playback = introVideo.play();
        if (playback && typeof playback.catch === "function") {
          playback.catch(function () {
            stage.classList.add("video-failed");
            sealTrigger.disabled = false;
            introStarted = false;
          });
        }
      }
      sealTrigger.addEventListener("click", playEnvelope);
      introVideo.addEventListener("playing", function () {
        stage.classList.add("video-playing");
      });
      introVideo.addEventListener("ended", revealCard);
      introVideo.addEventListener("error", function () {
        if (introStarted && !stage.classList.contains("card-revealed")) revealCard();
      });
      enterInvitation.addEventListener("click", open);
      function open() {
        if (opened || !introStarted) return;
        opened = true;
        var revealed = false;
        function revealInvitation() {
          if (revealed) return;
          revealed = true;
          document.body.classList.remove("locked");
          document.body.classList.add("invitation-open");
          scrollTo(0, 0);
          setTimeout(function () {
            burst(innerWidth / 2, innerHeight * 0.25, 18, true);
          }, 120);
        }
        stage.addEventListener("transitionend", function onExit(e) {
          if (e.target === stage && e.propertyName === "opacity") {
            stage.removeEventListener("transitionend", onExit);
            revealInvitation();
          }
        });
        stage.classList.add("gone");
        /* Fallback if the browser skips transitionend in a background tab. */
        setTimeout(revealInvitation, 700);
      }
      /* Stagger the invitation blocks as the envelope reveal completes. */
      (function () {
        var blocks = document.querySelectorAll("main > *");
        blocks.forEach(function (el, index) {
          el.classList.add("intro-reveal");
          // el.style.setProperty("--reveal-delay", (0.08 + index * 0.10) + "s");
          el.style.setProperty("--reveal-delay", (0.06 + index * 0.11) + "s");
        });
      })();

      /* Names */
      document.querySelectorAll(".nm").forEach(function (b) {
        b.addEventListener("click", function () {
          $("cap").textContent = b.dataset.c;
          var r = b.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top + r.height / 2, 14, true);
        });
      });

      /* Countdown */
      var target = new Date("2026-12-14T19:00:00+05:00").getTime(),
        cs = document.querySelectorAll("#count strong");
      function tick() {
        var t = Math.max(0, target - Date.now()),
          v = [
            Math.floor(t / 864e5),
            Math.floor((t % 864e5) / 36e5),
            Math.floor((t % 36e5) / 6e4),
            Math.floor((t % 6e4) / 1e3),
          ];
        v.forEach(function (n, i) {
          cs[i].textContent = n;
        });
      }
      tick();
      setInterval(tick, 1000);

      /* Diyas */
      var lit = 0,
        evs = document.querySelectorAll(".ev");
      evs.forEach(function (li) {
        var b = li.querySelector(".diya");
        b.addEventListener("click", function () {
          if (li.classList.contains("lit")) return;
          li.classList.add("lit");
          b.setAttribute("aria-pressed", "true");
          lit++;
          var r = b.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top + 10, 10, false);
          $("dcount").textContent =
            lit < 4
              ? lit + " / 4 دیے روشن"
              : "سب دیے روشن ہیں! آپ کا انتظار رہے گا۔";
          if (lit === 4) burst(innerWidth / 2, r.top, 40, true);
        });
      });

      /* Fairy lights */
      (function () {
        var L = $("lights"),
          cl = ["#f2d28d", "#d98b9d", "#fff0d1", "#c89a52", "#e8c477"];
        for (var i = 0; i < 12; i++) {
          // Keep every bulb inside the viewport on narrow screens.
          var u = -0.8 + (1.6 * i) / 11,
            e = document.createElement("i");
          e.style.left = 2 + (96 * i) / 11 + "%";
          e.style.top =
            -10 + 90 * Math.sqrt(1 - u * u) + 8 + (i % 2) * 10 + "px";
          e.style.color = cl[i % 5];
          e.style.animationDelay = i * 0.27 + "s";
          L.appendChild(e);
        }
      })();

      /* 3D ring */
      (function () {
        var box = $("r3d");
        if (typeof THREE === "undefined" || !box) return;
        try {
          var W = box.clientWidth,
            H = box.clientHeight,
            r = new THREE.WebGLRenderer({antialias: true, alpha: true});
          r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
          r.setSize(W, H);
          box.appendChild(r.domElement);
          var sc = new THREE.Scene(),
            cam = new THREE.PerspectiveCamera(35, W / H, 0.1, 50);
          cam.position.set(0, 0.2, 6.4);
          sc.add(new THREE.AmbientLight(0xffffff, 0.6));
          var a = new THREE.PointLight(0xffe2a8, 1.7, 30);
          a.position.set(3, 3, 5);
          sc.add(a);
          var b = new THREE.PointLight(0xe8768c, 1.3, 30);
          b.position.set(-4, -2, 3);
          sc.add(b);
          var c = new THREE.PointLight(0xffffff, 0.9, 30);
          c.position.set(0, 4, -3);
          sc.add(c);
          var g = new THREE.Group();
          sc.add(g);
          var gold = new THREE.MeshStandardMaterial({
            color: 0xe2b45c,
            metalness: 0.85,
            roughness: 0.25,
            emissive: 0x2a1c04,
          });
          g.add(
            new THREE.Mesh(
              new THREE.TorusGeometry(1.15, 0.15, 32, 120),
              gold,
            ),
          );
          var col = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.2, 0.22, 8),
            gold,
          );
          col.position.y = 1.3;
          g.add(col);
          var gem = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.42, 0),
            new THREE.MeshStandardMaterial({
              color: 0xdff3ff,
              metalness: 0.1,
              roughness: 0.05,
              emissive: 0x5aa7d8,
              emissiveIntensity: 0.4,
              flatShading: true,
            }),
          );
          gem.scale.y = 1.25;
          gem.position.y = 1.68;
          g.add(gem);
          var N = 90,
            pos = new Float32Array(N * 3);
          for (var i = 0; i < N; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 7;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 4.6;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
          }
          var pg = new THREE.BufferGeometry();
          pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
          var pts = new THREE.Points(
            pg,
            new THREE.PointsMaterial({
              color: 0xf4cf7a,
              size: 0.06,
              transparent: true,
              opacity: 0.9,
            }),
          );
          sc.add(pts);
          var rx = 0.2,
            ry = 0,
            vy = reduce ? 0 : 0.008,
            drag = false,
            lx = 0,
            t = 0,
            running = false,
            vis = true;
          function frame() {
            if (!vis) {
              running = false;
              return;
            }
            requestAnimationFrame(frame);
            t += 0.016;
            if (!drag) {
              ry += vy;
              vy += ((reduce ? 0 : 0.008) - vy) * 0.02;
            }
            g.rotation.y = ry;
            g.rotation.x = rx;
            g.position.y = Math.sin(t * 1.2) * 0.08;
            gem.rotation.y = t * 0.8;
            pts.rotation.y = t * 0.05;
            r.render(sc, cam);
          }
          function go() {
            if (!running) {
              running = true;
              frame();
            }
          }
          new IntersectionObserver(function (en) {
            vis = en[0].isIntersecting;
            if (vis) go();
          }).observe(box);
          box.addEventListener("pointerdown", function (e) {
            drag = true;
            lx = e.clientX;
            box.setPointerCapture(e.pointerId);
            var q = box.getBoundingClientRect();
            burst(q.left + q.width / 2, q.top + q.height / 2, 18, false);
          });
          box.addEventListener("pointermove", function (e) {
            if (!drag) return;
            var d = e.clientX - lx;
            lx = e.clientX;
            ry += d * 0.014;
            vy = d * 0.014;
          });
          function up() {
            drag = false;
          }
          box.addEventListener("pointerup", up);
          box.addEventListener("pointercancel", up);
          function resizeRenderer() {
            W = box.clientWidth;
            H = box.clientHeight;
            if (!W || !H) return;
            r.setSize(W, H);
            cam.aspect = W / H;
            cam.updateProjectionMatrix();
          }
          addEventListener("resize", resizeRenderer);
          if ("ResizeObserver" in window) {
            new ResizeObserver(resizeRenderer).observe(box);
          }
        } catch (err) {
          box.style.display = "none";
        }
      })();
    })();


// JavaScript block 3id="floating-petals-controller"
(function () {
      var host = document.getElementById("floating-petals");
      if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var count = 8;
      for (var i = 0; i < count; i++) {
        var petal = document.createElement("i");
        petal.className = "petal";
        petal.style.setProperty("--left", (4 + Math.random() * 92) + "%");
        petal.style.setProperty("--size", (9 + Math.random() * 8) + "px");
        petal.style.setProperty("--rotation", (Math.random() * 180) + "deg");
        petal.style.setProperty("--duration", (23 + Math.random() * 17) + "s");
        petal.style.setProperty("--delay", (-Math.random() * 38) + "s");
        petal.style.setProperty("--drift", (-35 + Math.random() * 70) + "px");
        petal.style.setProperty("--opacity", (0.22 + Math.random() * 0.2).toFixed(2));
        host.appendChild(petal);
      }
    })();

