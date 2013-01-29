<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">

  <title>{{settings.SITE_TITLE}}</title>
  <link rel="alternate" type="text/html" href="{{settings.SITE_URL}}"/>
  <link rel="self" type="application/atom+xml" href="{{settings.SITE_URL}}feed"/>
  <updated>{{updated|date('c')}}</updated>
  <id>urn:uuid:{{settings.SITE_ID}}</id>

  {% for post in posts %}
  <entry>
    <title>{{post.title}}</title>
    <id>urn:uuid:{{post.uuid}}</id>
    <updated>{{post.updatedAt|date('c')}}</updated>
    <link href="{{settings.SITE_URL}}posts/{{post.slug}}"/>
    <summary>{{post.summary}}</summary>
    <author>
      <name>{{post.author.firstname}} {{post.author.lastname}}</name>
      <email>{{post.author.email}}</email>
    </author>
    <content type="xhtml" xml:lang="en" xml:base="{{settings.SITE_URL}}">
      <div xmlns="http://www.w3.org/1999/xhtml">
        {% autoescape off %}
        {{post.body|markdown}}
        {% endautoescape %}
      </div>
    </content>
  </entry>
  {% endfor %}

</feed>