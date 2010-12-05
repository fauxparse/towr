class FacebookAuthentications < ActiveRecord::Migration
  def self.up
    create_table :facebook_authentications do |t|
      t.integer :facebook_id
      t.belongs_to :user, :null => false
    end
    
    add_index :facebook_authentications, :facebook_id
    add_index :facebook_authentications, :user_id
  end

  def self.down
    drop_table :facebook_authentications
  end
end
