---
layout: default
title: huni blog
---

<style>
.blog-home {
  max-width: 980px;
  margin: 0 auto;
  padding: 20px 0 56px;
}

.blog-home h1 {
  margin: 0 0 8px;
}

.blog-home .lead {
  margin: 0;
  color: #666;
}

.blog-home .quick-links {
  margin: 18px 0 28px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.blog-home .quick-links a {
  display: inline-block;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 999px;
  text-decoration: none;
}

.blog-home section {
  margin-top: 34px;
}

.blog-home h2 {
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.blog-home ul {
  margin: 0;
  padding-left: 18px;
}

.blog-home li {
  margin: 8px 0;
}

.blog-home .muted {
  color: #7a7a7a;
  font-size: 14px;
  margin-left: 6px;
}

.blog-home .empty {
  color: #777;
}
</style>

<div class="blog-home">
  <h1>huni blog</h1>
  <p class="lead">카테고리별로 글을 모아보는 블로그 홈입니다.</p>

  <div class="quick-links">
    <a href="{{ '/resume/' | relative_url }}">Resume</a>
    <a href="{{ '/writing/work/engineer-resume/' | relative_url }}">Writing / Work</a>
  </div>

  <section>
    <h2>Latest Posts</h2>
    {% if site.posts.size > 0 %}
      <ul>
        {% for post in site.posts limit: 10 %}
          <li>
            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
            <span class="muted">{{ post.date | date: "%Y-%m-%d" }}</span>
          </li>
        {% endfor %}
      </ul>
    {% else %}
      <p class="empty">아직 등록된 포스트가 없습니다.</p>
    {% endif %}
  </section>

  {% assign work_pages = site.pages | where_exp: "p", "p.url contains '/writing/work/'" %}
  <section>
    <h2>Category: work</h2>
    {% if work_pages.size > 0 %}
      <ul>
        {% for page in work_pages %}
          <li>
            <a href="{{ page.url | relative_url }}">{{ page.title | default: page.url }}</a>
          </li>
        {% endfor %}
      </ul>
    {% else %}
      <p class="empty">work 카테고리 글이 없습니다.</p>
    {% endif %}
  </section>

  {% assign writing_pages = site.pages | where_exp: "p", "p.url contains '/writing/'" %}
  <section>
    <h2>All Writing</h2>
    {% if writing_pages.size > 0 %}
      <ul>
        {% for page in writing_pages %}
          <li>
            <a href="{{ page.url | relative_url }}">{{ page.title | default: page.url }}</a>
            <span class="muted">{{ page.url }}</span>
          </li>
        {% endfor %}
      </ul>
    {% else %}
      <p class="empty">등록된 writing 페이지가 없습니다.</p>
    {% endif %}
  </section>
</div>
