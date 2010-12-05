# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20101205220220) do

  create_table "facebook_authentications", :force => true do |t|
    t.integer "facebook_id"
    t.integer "user_id",     :null => false
  end

  add_index "facebook_authentications", ["facebook_id"], :name => "index_facebook_authentications_on_facebook_id"
  add_index "facebook_authentications", ["user_id"], :name => "index_facebook_authentications_on_user_id"

  create_table "maps", :force => true do |t|
    t.string   "name",                       :null => false
    t.integer  "rows",       :default => 16, :null => false
    t.integer  "columns",    :default => 16, :null => false
    t.text     "contents"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "user_id"
  end

  add_index "maps", ["user_id"], :name => "index_maps_on_user_id"

  create_table "twitter_authentications", :force => true do |t|
    t.integer "twitter_id"
    t.string  "screen_name"
    t.integer "user_id",     :null => false
  end

  add_index "twitter_authentications", ["twitter_id"], :name => "index_twitter_authentications_on_twitter_id"
  add_index "twitter_authentications", ["user_id"], :name => "index_twitter_authentications_on_user_id"

  create_table "users", :force => true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
